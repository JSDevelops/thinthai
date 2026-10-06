class CommunityModel {
  final String id;
  final String name;
  final String province;
  final String region;
  final String description;
  final String history;
  final String coverImage;
  final String logoImage;
  final List<String> galleryImages;
  final int villagersCount;
  final double rating;
  final List<String> tags;
  final String hostName;
  final String contactPhone;
  final String locationCoordinates;

  const CommunityModel({
    required this.id,
    required this.name,
    required this.province,
    required this.region,
    required this.description,
    required this.history,
    required this.coverImage,
    required this.logoImage,
    required this.galleryImages,
    required this.villagersCount,
    required this.rating,
    required this.tags,
    required this.hostName,
    required this.contactPhone,
    required this.locationCoordinates,
  });
}

class ProductModel {
  final String id;
  final String title;
  final String communityId;
  final String communityName;
  final String province;
  final int price;
  final String imageUrl;
  final String story;
  final String artisanName;
  final double rating;
  final String category; // 'อาหารและชา', 'ผ้าทอและเครื่องแต่งกาย', 'งานจักสาน', 'เครื่องหอมและสบู่'
  final int stockCount;

  const ProductModel({
    required this.id,
    required this.title,
    required this.communityId,
    required this.communityName,
    required this.province,
    required this.price,
    required this.imageUrl,
    required this.story,
    required this.artisanName,
    required this.rating,
    required this.category,
    this.stockCount = 15,
  });
}

class CartItemModel {
  final ProductModel product;
  int quantity;

  CartItemModel({
    required this.product,
    this.quantity = 1,
  });

  int get totalPrice => product.price * quantity;
}

class BookingModel {
  final String id;
  final String bookingRef;
  final String tripId;
  final String tripTitle;
  final String communityName;
  final String province;
  final String imageUrl;
  final DateTime travelDate;
  final int participantsCount;
  final int totalPrice;
  final String status; // 'confirmed', 'completed', 'pending', 'cancelled'
  final String qrCodeToken;
  final String hostName;
  final String hostContact;

  const BookingModel({
    required this.id,
    required this.bookingRef,
    required this.tripId,
    required this.tripTitle,
    required this.communityName,
    required this.province,
    required this.imageUrl,
    required this.travelDate,
    required this.participantsCount,
    required this.totalPrice,
    required this.status,
    required this.qrCodeToken,
    required this.hostName,
    required this.hostContact,
  });
}
