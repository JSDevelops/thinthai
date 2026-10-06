class PassportBadgeModel {
  final String id;
  final String title;
  final String communityName;
  final String province;
  final String iconEmoji;
  final DateTime earnedDate;
  final String description;
  final bool isUnlocked;

  const PassportBadgeModel({
    required this.id,
    required this.title,
    required this.communityName,
    required this.province,
    required this.iconEmoji,
    required this.earnedDate,
    required this.description,
    this.isUnlocked = true,
  });
}

class ReviewModel {
  final String id;
  final String authorName;
  final String authorAvatar;
  final double rating;
  final String date;
  final String comment;
  final String? travelPhotoUrl;

  const ReviewModel({
    required this.id,
    required this.authorName,
    required this.authorAvatar,
    required this.rating,
    required this.date,
    required this.comment,
    this.travelPhotoUrl,
  });
}
