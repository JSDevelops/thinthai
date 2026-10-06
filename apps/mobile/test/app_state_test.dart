import 'package:flutter_test/flutter_test.dart';
import 'package:thinthai_mobile/data/mock_data.dart';
import 'package:thinthai_mobile/state/app_state.dart';

void main() {
  group('AppState Business Logic Tests', () {
    late AppState appState;

    setUp(() {
      appState = AppState();
    });

    test('Bookmark toggle should update saved trips', () {
      final tripId = 'trip-2';
      final initialStatus = appState.isTripBookmarked(tripId);
      appState.toggleTripBookmark(tripId);
      expect(appState.isTripBookmarked(tripId), !initialStatus);
      appState.toggleTripBookmark(tripId);
      expect(appState.isTripBookmarked(tripId), initialStatus);
    });

    test('Booking creation should add to bookings list and calculate impact', () {
      final trip = MockData.trips.first;
      final initialBookingsCount = appState.bookings.length;
      final initialTrees = appState.treesContributed;

      appState.addBooking(
        trip: trip,
        travelDate: DateTime.now().add(const Duration(days: 5)),
        participantsCount: 2,
        totalPrice: trip.pricePerPerson * 2,
      );

      expect(appState.bookings.length, initialBookingsCount + 1);
      expect(appState.bookings.first.tripTitle, trip.title);
      expect(appState.treesContributed, initialTrees + (trip.impactTreeCount * 2));
    });

    test('Cart operations should add, update quantity, and calculate total', () {
      appState.clearCart();
      final product = MockData.products.first;

      appState.addToCart(product);
      expect(appState.cartItemCount, 1);
      expect(appState.cartTotalPrice, product.price);

      appState.addToCart(product);
      expect(appState.cartItemCount, 2);
      expect(appState.cartTotalPrice, product.price * 2);

      appState.removeFromCart(product.id);
      expect(appState.cartItemCount, 0);
      expect(appState.cartTotalPrice, 0);
    });
  });
}
