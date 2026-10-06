import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../data/mock_data.dart';
import '../models/trip_model.dart';
import '../state/app_state.dart';
import '../widgets/booking_bottom_sheet.dart';
import '../widgets/haptic_tap.dart';
import 'community_detail_screen.dart';

class TripDetailScreen extends StatefulWidget {
  final TripModel trip;

  const TripDetailScreen({super.key, required this.trip});

  @override
  State<TripDetailScreen> createState() => _TripDetailScreenState();
}

class _TripDetailScreenState extends State<TripDetailScreen> {
  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,###', 'th');

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              // 1. Hero Image Sliver App Bar
              SliverAppBar(
                expandedHeight: 340,
                pinned: true,
                stretch: true,
                backgroundColor: AppColors.primaryDark,
                leading: Padding(
                  padding: const EdgeInsets.only(left: 16),
                  child: Center(
                    child: HapticTap(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.85),
                          shape: BoxShape.circle,
                          boxShadow: const [
                            BoxShadow(color: Color(0x1F000000), blurRadius: 8),
                          ],
                        ),
                        child: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppColors.textMain),
                      ),
                    ),
                  ),
                ),
                actions: [
                  Padding(
                    padding: const EdgeInsets.only(right: 16),
                    child: Center(
                      child: AnimatedBuilder(
                        animation: AppState(),
                        builder: (context, _) {
                          final isBookmarked = AppState().isTripBookmarked(widget.trip.id);
                          return HapticTap(
                            onTap: () {
                              HapticFeedback.lightImpact();
                              AppState().toggleTripBookmark(widget.trip.id);
                            },
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.85),
                                shape: BoxShape.circle,
                                boxShadow: const [
                                  BoxShadow(color: Color(0x1F000000), blurRadius: 8),
                                ],
                              ),
                              child: Icon(
                                isBookmarked ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                                size: 20,
                                color: isBookmarked ? AppColors.accent : AppColors.textMain,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  stretchModes: const [StretchMode.zoomBackground],
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.network(
                        widget.trip.imageUrl,
                        fit: BoxFit.cover,
                      ),
                      DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withValues(alpha: 0.4),
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.6),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // 2. Content Body
              SliverToBoxAdapter(
                child: Container(
                  transform: Matrix4.translationValues(0.0, -24.0, 0.0),
                  decoration: const BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                  ),
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 110),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Location & Rating Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.location_on_rounded, size: 18, color: AppColors.primary),
                              const SizedBox(width: 4),
                              Text(
                                '${widget.trip.province}, ${widget.trip.region}',
                                style: AppTypography.labelLarge.copyWith(color: AppColors.primary),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.star_rounded, size: 16, color: AppColors.star),
                                const SizedBox(width: 4),
                                Text(
                                  '${widget.trip.rating} (${widget.trip.reviewsCount} รีวิว)',
                                  style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Title
                      Text(
                        widget.trip.title,
                        style: AppTypography.titleLarge.copyWith(fontSize: 22, height: 1.3),
                      ),
                      const SizedBox(height: 18),

                      // Host Profile Card (Clickable to Community)
                      HapticTap(
                        onTap: () {
                          final community = MockData.communities.firstWhere(
                            (c) => c.id == widget.trip.communityId,
                            orElse: () => MockData.communities.first,
                          );
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CommunityDetailScreen(community: community),
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.borderLight),
                            boxShadow: const [
                              BoxShadow(color: Color(0x0A000000), blurRadius: 10, offset: Offset(0, 4)),
                            ],
                          ),
                          child: Row(
                            children: [
                              Stack(
                                children: [
                                  CircleAvatar(
                                    radius: 26,
                                    backgroundImage: NetworkImage(widget.trip.hostAvatar),
                                  ),
                                  Positioned(
                                    bottom: 0,
                                    right: 0,
                                    child: Container(
                                      padding: const EdgeInsets.all(2),
                                      decoration: const BoxDecoration(
                                        color: Colors.white,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.verified_rounded, size: 16, color: AppColors.primary),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'ผู้นำทางชุมชนที่ได้รับการรับรอง',
                                      style: AppTypography.labelSmall.copyWith(color: AppColors.primary),
                                    ),
                                    Text(
                                      widget.trip.hostName,
                                      style: AppTypography.titleMedium.copyWith(fontSize: 16),
                                    ),
                                    Text(
                                      widget.trip.communityName,
                                      style: AppTypography.bodyMedium.copyWith(fontSize: 13),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textLight),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Description
                      Text('เกี่ยวกับทริปนี้', style: AppTypography.titleMedium),
                      const SizedBox(height: 8),
                      Text(
                        widget.trip.description,
                        style: AppTypography.bodyMedium.copyWith(fontSize: 15, height: 1.6),
                      ),
                      const SizedBox(height: 24),

                      // Highlights
                      Text('จุดเด่นที่คุณจะได้รับ', style: AppTypography.titleMedium),
                      const SizedBox(height: 12),
                      ...widget.trip.highlights.map((h) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.check_circle_rounded, size: 20, color: AppColors.accent),
                                const SizedBox(width: 10),
                                Expanded(child: Text(h, style: AppTypography.bodyMedium)),
                              ],
                            ),
                          )),
                      const SizedBox(height: 24),

                      // Inclusions & Packing Tips
                      if (widget.trip.packingTips.isNotEmpty) ...[
                        Text('ข้อแนะนำและการเตรียมตัว', style: AppTypography.titleMedium),
                        const SizedBox(height: 10),
                        ...widget.trip.packingTips.map(
                          (tip) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Row(
                              children: [
                                const Icon(Icons.backpack_outlined, size: 18, color: AppColors.primary),
                                const SizedBox(width: 8),
                                Expanded(child: Text(tip, style: AppTypography.bodyMedium)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],

                      // Day Itinerary Timeline
                      if (widget.trip.itinerary.isNotEmpty) ...[
                        Text('กำหนดการเดินทาง (${widget.trip.durationText})', style: AppTypography.titleMedium),
                        const SizedBox(height: 14),
                        ...widget.trip.itinerary.map((day) => _buildDayTimeline(day)),
                        const SizedBox(height: 20),
                      ],

                      // Sustainability / Impact Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.primaryDark,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.eco_rounded, color: AppColors.gold, size: 28),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'การท่องเที่ยวอย่างยั่งยืน',
                                    style: AppTypography.labelLarge.copyWith(color: AppColors.gold),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'รายได้ ${widget.trip.localIncomePercentage}% ส่งตรงสู่ชาวบ้าน และร่วมสนับสนุนปลูกป่าชุมชน ${widget.trip.impactTreeCount} ต้น',
                                    style: AppTypography.bodyMedium.copyWith(color: Colors.white, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Reviews
                      if (widget.trip.reviews.isNotEmpty) ...[
                        Text('รีวิวจากนักเดินทางจริง', style: AppTypography.titleMedium),
                        const SizedBox(height: 12),
                        ...widget.trip.reviews.map(
                          (rev) => Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.borderLight),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(radius: 16, backgroundImage: NetworkImage(rev.authorAvatar)),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(rev.authorName, style: AppTypography.labelLarge),
                                          Text(rev.date, style: AppTypography.labelSmall),
                                        ],
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        const Icon(Icons.star_rounded, size: 16, color: AppColors.star),
                                        Text('${rev.rating}', style: AppTypography.labelSmall),
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(rev.comment, style: AppTypography.bodyMedium),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),

          // 3. Sticky Bottom Booking Bar
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: const [
                  BoxShadow(color: Color(0x1A000000), blurRadius: 20, offset: Offset(0, -4)),
                ],
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: SafeArea(
                top: false,
                child: Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('ราคาเริ่มต้น', style: AppTypography.labelSmall),
                        Row(
                          children: [
                            Text(
                              '฿${currencyFormatter.format(widget.trip.pricePerPerson)}',
                              style: AppTypography.titleLarge.copyWith(
                                color: AppColors.accent,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            Text(' / คน', style: AppTypography.bodyMedium.copyWith(fontSize: 13)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => BookingBottomSheet.show(context, widget.trip),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accent,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: Text(
                          'จองทริปตอนนี้',
                          style: AppTypography.labelLarge.copyWith(color: Colors.white, fontSize: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDayTimeline(ItineraryDay day) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  'วันที่ ${day.dayNumber}',
                  style: AppTypography.labelSmall.copyWith(
                    color: AppColors.primaryDark,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  day.dayTitle,
                  style: AppTypography.titleMedium.copyWith(fontSize: 15),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...day.items.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.time,
                      style: AppTypography.labelLarge.copyWith(color: AppColors.accent, fontSize: 13),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.title, style: AppTypography.labelLarge.copyWith(fontSize: 14)),
                          Text(item.description, style: AppTypography.bodyMedium.copyWith(fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}
