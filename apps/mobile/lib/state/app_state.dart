import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/trip_model.dart';
import '../models/community_model.dart';
import '../models/passport_badge_model.dart';

class AppState extends ChangeNotifier {
  static final AppState _instance = AppState._internal();
  factory AppState() => _instance;
  AppState._internal() {
    _bookings.addAll(MockData.initialBookings);
    _badges.addAll(MockData.passportBadges);
  }

  // Bookmarks
  final Set<String> _bookmarkedTripIds = {'trip-1'};
  Set<String> get bookmarkedTripIds => _bookmarkedTripIds;

  bool isTripBookmarked(String tripId) => _bookmarkedTripIds.contains(tripId);

  void toggleTripBookmark(String tripId) {
    if (_bookmarkedTripIds.contains(tripId)) {
      _bookmarkedTripIds.remove(tripId);
    } else {
      _bookmarkedTripIds.add(tripId);
    }
    notifyListeners();
  }

  // Bookings
  final List<BookingModel> _bookings = [];
  List<BookingModel> get bookings => List.unmodifiable(_bookings);

  void addBooking({
    required TripModel trip,
    required DateTime travelDate,
    required int participantsCount,
    required int totalPrice,
  }) {
    final newBooking = BookingModel(
      id: 'bk-${DateTime.now().millisecondsSinceEpoch}',
      bookingRef: 'TT-${DateTime.now().year}-${(10000 + _bookings.length * 137).toString()}',
      tripId: trip.id,
      tripTitle: trip.title,
      communityName: trip.communityName,
      province: trip.province,
      imageUrl: trip.imageUrl,
      travelDate: travelDate,
      participantsCount: participantsCount,
      totalPrice: totalPrice,
      status: 'confirmed',
      qrCodeToken: 'THINTHAI_PASS_${DateTime.now().millisecondsSinceEpoch}',
      hostName: trip.hostName,
      hostContact: '081-999-0123',
    );
    _bookings.insert(0, newBooking);
    _treesContributed += trip.impactTreeCount * participantsCount;
    _totalSpentInCommunities += totalPrice;
    notifyListeners();
  }

  void cancelBooking(String bookingId) {
    final index = _bookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      _bookings.removeAt(index);
      notifyListeners();
    }
  }

  // Shopping Cart (Local Marketplace)
  final List<CartItemModel> _cart = [];
  List<CartItemModel> get cart => List.unmodifiable(_cart);

  int get cartItemCount => _cart.fold(0, (sum, item) => sum + item.quantity);
  int get cartTotalPrice => _cart.fold(0, (sum, item) => sum + item.totalPrice);

  void addToCart(ProductModel product) {
    final existingIndex = _cart.indexWhere((item) => item.product.id == product.id);
    if (existingIndex != -1) {
      _cart[existingIndex].quantity++;
    } else {
      _cart.add(CartItemModel(product: product, quantity: 1));
    }
    notifyListeners();
  }

  void removeFromCart(String productId) {
    _cart.removeWhere((item) => item.product.id == productId);
    notifyListeners();
  }

  void updateCartQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    final item = _cart.firstWhere((item) => item.product.id == productId);
    item.quantity = quantity;
    notifyListeners();
  }

  void clearCart() {
    _cart.clear();
    notifyListeners();
  }

  // Badges & Passport
  final List<PassportBadgeModel> _badges = [];
  List<PassportBadgeModel> get badges => List.unmodifiable(_badges);

  int _treesContributed = 12;
  int get treesContributed => _treesContributed;

  int _totalSpentInCommunities = 7250;
  int get totalSpentInCommunities => _totalSpentInCommunities;

  int get supportedVillagesCount => 3;
}
