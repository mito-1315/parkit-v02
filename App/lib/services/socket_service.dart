import 'dart:async';

import 'package:socket_io_client/socket_io_client.dart' as io;

const _socketUrl = 'http://localhost:4000';

class SocketService {
  io.Socket? _socket;
  final _controller = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get updates => _controller.stream;

  bool get isConnected => _socket?.connected ?? false;

  /// Connect to the /dashboard namespace with the provided JWT.
  void connect(String token, {int? facilityId}) {
    _socket?.dispose();

    _socket = io.io(
      '$_socketUrl/dashboard',
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionDelay(2000)
          .setReconnectionAttempts(10)
          .build(),
    );

    _socket!.onConnect((_) {
      if (facilityId != null) {
        joinFacility(facilityId);
      }
    });

    // Listen for generic slot/session update events the backend may emit.
    for (final event in [
      'slotUpdate',
      'sessionUpdate',
      'slot_update',
      'session_update',
      'parking_update',
    ]) {
      _socket!.on(event, (data) {
        if (data is Map) {
          _controller.add(Map<String, dynamic>.from(data));
        }
      });
    }

    _socket!.onDisconnect((_) {});
    _socket!.onError((err) {});
  }

  void joinFacility(int facilityId) {
    _socket?.emit('joinFacility', facilityId);
  }

  void leaveFacility(int facilityId) {
    _socket?.emit('leaveFacility', facilityId);
  }

  void disconnect() {
    _socket?.dispose();
    _socket = null;
  }

  void dispose() {
    disconnect();
    _controller.close();
  }
}
