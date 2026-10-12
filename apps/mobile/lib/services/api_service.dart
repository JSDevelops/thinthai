import 'dart:convert';
import 'dart:io';
import '../data/mock_data.dart';
import '../models/trip_model.dart';

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

  final HttpClient _client = HttpClient()
    ..connectionTimeout = const Duration(seconds: 4);

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
            );
          }).toList();
        }
      }
    } catch (_) {
      // Graceful offline fallback to rich MockData if local API is unreachable
    }
    return MockData.featuredTrips;
  }
}
