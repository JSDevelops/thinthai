import 'dart:convert';
import 'dart:io';
import '../data/mock_data.dart';
import '../models/trip_model.dart';

class PaymentIntentResponse {
  final String id;
  final String targetType;
  final String targetId;
  final int amountSatang;
  final double amountBaht;
  final String status;
  final String qrPayload;
  final String providerRef;
  final DateTime expiresAt;
  final String targetSummary;
  final bool isSandbox;

  PaymentIntentResponse({
    required this.id,
    required this.targetType,
    required this.targetId,
    required this.amountSatang,
    required this.amountBaht,
    required this.status,
    required this.qrPayload,
    required this.providerRef,
    required this.expiresAt,
    required this.targetSummary,
    this.isSandbox = true,
  });
}

class BookingCreationResult {
  final bool success;
  final String? bookingId;
  final String? message;
  final PaymentIntentResponse? payment;

  BookingCreationResult({
    required this.success,
    this.bookingId,
    this.message,
    this.payment,
  });
}

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // Android emulator uses 10.0.2.2, iOS simulator and desktop use 127.0.0.1
  String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:4200/api/v1';
    }
    return 'http://127.0.0.1:4200/api/v1';
  }

  String get webOrigin => 'http://127.0.0.1:3200';

  final HttpClient _client = HttpClient()
    ..connectionTimeout = const Duration(seconds: 4);

  // Stored cookie / session for mobile requests
  String? _sessionCookie;
  void setSessionCookie(String? cookie) {
    _sessionCookie = cookie;
  }

  Map<String, String> _buildHeaders() {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'origin': webOrigin,
      'x-thinthai-action': '1',
    };
    if (_sessionCookie != null) {
      headers['cookie'] = _sessionCookie!;
    }
    return headers;
  }

  Future<List<TripModel>> fetchTrips() async {
    try {
      final uri = Uri.parse('$baseUrl/trips');
      final request = await _client.getUrl(uri);
      final response = await request.close();

      if (response.statusCode == 200) {
        final bodyString = await response.transform(utf8.decoder).join();
        final List<dynamic> data = jsonDecode(bodyString);

        if (data.isNotEmpty) {
          return data.map((json) {
            final categoryKey = json['category'] ?? 'culture';
            String categoryTh = 'ธรรมชาติ';
            if (categoryKey == 'culture') categoryTh = 'หัตถกรรม';
            if (categoryKey == 'food') categoryTh = 'อาหารพื้นบ้าน';

            final priceSatang = json['priceSatang'] as int? ?? 120000;
            final priceBaht = (priceSatang / 100).round();

            // Parse departures
            final List<TripDepartureModel> departuresList = [];
            if (json['departures'] is List) {
              for (final d in json['departures']) {
                if (d is Map<String, dynamic>) {
                  departuresList.add(TripDepartureModel(
                    id: d['id'] ?? '',
                    startsAt: DateTime.tryParse(d['startsAt'] ?? '') ?? DateTime.now().add(const Duration(days: 3)),
                    capacity: d['capacity'] ?? 10,
                    remaining: d['remaining'] ?? 10,
                    active: d['active'] ?? true,
                    version: d['version'] ?? 1,
                  ));
                }
              }
            }

            return TripModel(
              id: json['id'] ?? '',
              title: json['title'] ?? '',
              communityId: json['storeId'] ?? '',
              communityName: json['storeName'] ?? 'ชุมชนถิ่นไทย',
              hostName: 'ผู้นำทางชุมชน',
              hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
              province: json['province'] ?? 'เชียงใหม่',
              region: 'เหนือ',
              category: categoryTh,
              rating: 4.9,
              reviewsCount: 24,
              pricePerPerson: priceBaht,
              durationText: '${json['durationHours'] ?? 4} ชั่วโมง',
              durationDays: 1,
              imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80',
              galleryUrls: const [
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
              ],
              description: json['description'] ?? '',
              highlights: [
                'เรียนรู้วิถีชีวิตกับชาวบ้าน',
                'ร่วมกระจายรายได้สู่ชุมชน',
              ],
              inclusions: [
                'อุปกรณ์ทำกิจกรรม',
                'อาหารว่างและเครื่องดื่มพื้นบ้าน',
              ],
              packingTips: [
                'ชุดสวมใส่สบาย',
                'กระบอกน้ำดื่มส่วนตัว',
              ],
              itinerary: [
                ItineraryDay(
                  dayNumber: 1,
                  dayTitle: 'สัมผัสวิถีถิ่น',
                  items: [
                    ItineraryItem(
                      time: '09:00',
                      title: 'จุดนัดพบ: ${json['meetingPoint'] ?? 'ศาลาชุมชน'}',
                      description: 'พบปะผู้นำทางและปฐมนิเทศ',
                      iconType: 'walk',
                    ),
                  ],
                ),
              ],
              reviews: const [],
              isVerifiedHost: true,
              impactTreeCount: 3,
              localIncomePercentage: 90,
              departures: departuresList,
            );
          }).toList();
        }
      }
    } catch (_) {
      // Graceful offline fallback to rich MockData if local API is unreachable
    }
    return MockData.featuredTrips;
  }

  /// Create booking via backend API with transaction & lock
  Future<BookingCreationResult> createBooking({
    required String departureId,
    required int seats,
    required int expectedPriceSatang,
    required String contactName,
    required String phone,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/bookings');
      final request = await _client.postUrl(uri);
      
      _buildHeaders().forEach((k, v) => request.headers.set(k, v));

      // Generate idempotency request key
      final requestKey = 'mobile-${DateTime.now().millisecondsSinceEpoch}-${seats}';
      final payload = jsonEncode({
        'departureId': departureId,
        'seats': seats,
        'expectedPriceSatang': expectedPriceSatang,
        'contactName': contactName,
        'phone': phone,
        'requestKey': requestKey,
      });

      request.write(payload);
      final response = await request.close();
      final bodyString = await response.transform(utf8.decoder).join();

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(bodyString);
        final bookingId = data['id'] as String?;

        // Immediately request PromptPay payment intent
        PaymentIntentResponse? payment;
        if (bookingId != null) {
          payment = await createPaymentIntent(
            targetType: 'booking',
            targetId: bookingId,
          );
        }

        return BookingCreationResult(
          success: true,
          bookingId: bookingId,
          payment: payment,
        );
      } else {
        String msg = 'ไม่สามารถสร้างการจองได้';
        try {
          final errJson = jsonDecode(bodyString);
          if (errJson['message'] != null) msg = errJson['message'];
        } catch (_) {}
        return BookingCreationResult(success: false, message: msg);
      }
    } catch (e) {
      return BookingCreationResult(
        success: false,
        message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ (${e.toString()})',
      );
    }
  }

  /// Create payment intent (PromptPay QR) for a booking or order
  Future<PaymentIntentResponse?> createPaymentIntent({
    required String targetType,
    required String targetId,
    String method = 'promptpay',
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/payments');
      final request = await _client.postUrl(uri);
      _buildHeaders().forEach((k, v) => request.headers.set(k, v));

      final payload = jsonEncode({
        'targetType': targetType,
        'targetId': targetId,
        'method': method,
      });

      request.write(payload);
      final response = await request.close();
      if (response.statusCode >= 200 && response.statusCode < 300) {
        final bodyString = await response.transform(utf8.decoder).join();
        final data = jsonDecode(bodyString);
        return PaymentIntentResponse(
          id: data['id'] ?? '',
          targetType: data['targetType'] ?? targetType,
          targetId: data['targetId'] ?? targetId,
          amountSatang: data['amountSatang'] ?? 0,
          amountBaht: (data['amountBaht'] as num?)?.toDouble() ?? 0.0,
          status: data['status'] ?? 'pending',
          qrPayload: data['qrPayload'] ?? '',
          providerRef: data['providerRef'] ?? '',
          expiresAt: DateTime.tryParse(data['expiresAt'] ?? '') ??
              DateTime.now().add(const Duration(minutes: 30)),
          targetSummary: data['targetSummary'] ?? '',
          isSandbox: true,
        );
      }
    } catch (_) {}
    return null;
  }

  /// Simulate payment in sandbox mode
  Future<bool> simulatePayment(String paymentId) async {
    try {
      final uri = Uri.parse('$baseUrl/payments/$paymentId/simulate');
      final request = await _client.postUrl(uri);
      _buildHeaders().forEach((k, v) => request.headers.set(k, v));
      request.write('{}');
      final response = await request.close();
      return response.statusCode >= 200 && response.statusCode < 300;
    } catch (_) {
      return false;
    }
  }
}
