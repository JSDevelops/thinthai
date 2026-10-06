import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../models/community_model.dart';
import '../state/app_state.dart';
import '../widgets/haptic_tap.dart';

class BookingsScreen extends StatelessWidget {
  const BookingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dateFormatter = DateFormat('d MMM yyyy', 'th');
    final currencyFormatter = NumberFormat('#,###', 'th');

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('ทริปของฉัน', style: AppTypography.titleLarge),
        centerTitle: false,
      ),
      body: AnimatedBuilder(
        animation: AppState(),
        builder: (context, _) {
          final bookings = AppState().bookings;

          if (bookings.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.confirmation_number_outlined, size: 64, color: Colors.grey),
                  const SizedBox(height: 14),
                  Text('ยังไม่มีรายการจองทริป', style: AppTypography.titleMedium),
                  const SizedBox(height: 6),
                  Text('ค้นหาทริปท่องเที่ยวชุมชนและจองเพื่อเริ่มต้นการเดินทาง', style: AppTypography.bodyMedium),
                ],
              ),
            );
          }

          return ListView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 110),
            children: [
              Text('รายการจองที่กำลังจะมาถึง (${bookings.length})', style: AppTypography.titleMedium),
              const SizedBox(height: 14),
              ...bookings.map((booking) => _buildBookingCard(context, booking, dateFormatter, currencyFormatter)),
            ],
          );
        },
      ),
    );
  }

  Widget _buildBookingCard(
    BuildContext context,
    BookingModel booking,
    DateFormat dateFormatter,
    NumberFormat currencyFormatter,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: const [
          BoxShadow(color: Color(0x12000000), blurRadius: 18, offset: Offset(0, 6)),
        ],
      ),
      child: Column(
        children: [
          // Header banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            decoration: const BoxDecoration(
              color: AppColors.primaryDark,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('วันเดินทาง', style: AppTypography.labelSmall.copyWith(color: AppColors.gold)),
                    const SizedBox(height: 2),
                    Text(
                      dateFormatter.format(booking.travelDate),
                      style: AppTypography.titleMedium.copyWith(color: Colors.white, fontSize: 16),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.25),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.greenAccent),
                  ),
                  child: const Text('ยืนยันแล้ว',
                      style: TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),

          // Booking details
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(booking.tripTitle, style: AppTypography.titleMedium.copyWith(fontSize: 17)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.location_on_rounded, size: 16, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Text(
                      '${booking.communityName}, จ.${booking.province}',
                      style: AppTypography.bodyMedium.copyWith(color: AppColors.primary, fontWeight: FontWeight.w600),
                    ),
                    const Spacer(),
                    Text('${booking.participantsCount} ท่าน', style: AppTypography.labelLarge),
                  ],
                ),
                const SizedBox(height: 18),

                // QR Code Pass Section
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.qr_code_2_rounded, size: 130, color: AppColors.primaryDark),
                        const SizedBox(height: 8),
                        Text('REF: ${booking.bookingRef}',
                            style: AppTypography.labelLarge.copyWith(letterSpacing: 1.5, fontSize: 13)),
                        const SizedBox(height: 2),
                        Text('แสดง QR ให้ผู้ประสานงานชุมชนเมื่อเดินทางถึง',
                            style: AppTypography.bodyMedium.copyWith(fontSize: 11)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 18),

                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.phone_in_talk_rounded, size: 18),
                        label: const Text('ติดต่อผู้ดูแล'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: const BorderSide(color: AppColors.primary),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: () {
                          HapticFeedback.lightImpact();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('โทรหา ${booking.hostName} (${booking.hostContact})')),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.map_rounded, size: 18),
                        label: const Text('เส้นทางนำทาง'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: () {
                          HapticFeedback.lightImpact();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('กำลังเปิดพิกัดนำทางไปยัง ${booking.communityName}')),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
