import 'passport_badge_model.dart';

class ItineraryItem {
  final String time;
  final String title;
  final String description;
  final String iconType; // 'drive', 'tea', 'walk', 'craft', 'food'

  const ItineraryItem({
    required this.time,
    required this.title,
    required this.description,
    required this.iconType,
  });
}

class ItineraryDay {
  final int dayNumber;
  final String dayTitle;
  final List<ItineraryItem> items;

  const ItineraryDay({
    required this.dayNumber,
    required this.dayTitle,
    required this.items,
  });
}

class TripModel {
  final String id;
  final String title;
  final String communityId;
  final String communityName;
  final String hostName;
  final String hostAvatar;
  final String province;
  final String region; // 'เหนือ', 'กลาง', 'อีสาน', 'ใต้', 'ตะวันออก'
  final String category; // 'โฮมสเตย์', 'หัตถกรรม', 'อาหารพื้นบ้าน', 'ธรรมชาติ'
  final double rating;
  final int reviewsCount;
  final int pricePerPerson;
  final String durationText;
  final int durationDays;
  final String imageUrl;
  final List<String> galleryUrls;
  final String description;
  final List<String> highlights;
  final List<String> inclusions;
  final List<String> packingTips;
  final List<ItineraryDay> itinerary;
  final List<ReviewModel> reviews;
  final bool isVerifiedHost;
  final int impactTreeCount;
  final int localIncomePercentage;

  const TripModel({
    required this.id,
    required this.title,
    required this.communityId,
    required this.communityName,
    required this.hostName,
    required this.hostAvatar,
    required this.province,
    required this.region,
    required this.category,
    required this.rating,
    required this.reviewsCount,
    required this.pricePerPerson,
    required this.durationText,
    required this.durationDays,
    required this.imageUrl,
    required this.galleryUrls,
    required this.description,
    required this.highlights,
    required this.inclusions,
    required this.packingTips,
    required this.itinerary,
    required this.reviews,
    this.isVerifiedHost = true,
    this.impactTreeCount = 5,
    this.localIncomePercentage = 70,
  });
}
