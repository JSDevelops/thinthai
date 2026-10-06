import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../data/mock_data.dart';
import '../models/community_model.dart';
import '../widgets/haptic_tap.dart';
import '../widgets/trip_card.dart';
import 'trip_detail_screen.dart';

class CommunityDetailScreen extends StatelessWidget {
  final CommunityModel community;

  const CommunityDetailScreen({super.key, required this.community});

  @override
  Widget build(BuildContext context) {
    // Filter trips for this community
    final communityTrips = MockData.trips.where((t) => t.communityId == community.id).toList();
    // Filter products for this community
    final communityProducts = MockData.products.where((p) => p.communityId == community.id).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // Sliver Header
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: AppColors.primaryDark,
            leading: Center(
              child: HapticTap(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.85),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppColors.textMain),
                ),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(community.coverImage, fit: BoxFit.cover),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.3),
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.7),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 20,
                    left: 20,
                    right: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          community.name,
                          style: AppTypography.displayLarge.copyWith(color: Colors.white, fontSize: 24),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on_rounded, color: AppColors.gold, size: 16),
                            const SizedBox(width: 4),
                            Text(
                              '${community.province} (${community.region})',
                              style: AppTypography.bodyMedium.copyWith(color: Colors.white70),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                'ชาวบ้าน ${community.villagersCount} ครัวเรือน',
                                style: const TextStyle(color: Colors.white, fontSize: 12),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Community Info Body
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tags
                  Wrap(
                    spacing: 8,
                    children: community.tags
                        .map(
                          (t) => Chip(
                            label: Text(t),
                            backgroundColor: AppColors.primaryContainer,
                            labelStyle: AppTypography.labelSmall.copyWith(color: AppColors.primaryDark),
                            side: BorderSide.none,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 18),

                  // History & Wisdom
                  Text('เรื่องเล่าและประวัติศาสตร์ชุมชน', style: AppTypography.titleMedium),
                  const SizedBox(height: 8),
                  Text(
                    community.history,
                    style: AppTypography.bodyMedium.copyWith(fontSize: 15, height: 1.6),
                  ),
                  const SizedBox(height: 24),

                  // Host Contact Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundImage: NetworkImage(community.logoImage),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('ผู้ประสานงานหลัก', style: AppTypography.labelSmall),
                              Text(community.hostName, style: AppTypography.titleMedium.copyWith(fontSize: 15)),
                              Text(community.contactPhone,
                                  style: AppTypography.bodyMedium.copyWith(color: AppColors.primary)),
                            ],
                          ),
                        ),
                        IconButton.filledTonal(
                          icon: const Icon(Icons.phone_rounded, color: AppColors.primary),
                          onPressed: () {
                            HapticFeedback.lightImpact();
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Trips from this community
                  if (communityTrips.isNotEmpty) ...[
                    Text('ทริปท่องเที่ยวของชุมชนนี้', style: AppTypography.titleMedium),
                    const SizedBox(height: 14),
                    ...communityTrips.map(
                      (trip) => Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: TripCard(
                          trip: trip,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => TripDetailScreen(trip: trip)),
                            );
                          },
                        ),
                      ),
                    ),
                  ],

                  // Craft products
                  if (communityProducts.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Text('ของดีและงานคราฟต์จากชุมชน', style: AppTypography.titleMedium),
                    const SizedBox(height: 12),
                    ...communityProducts.map(
                      (prod) => Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.borderLight),
                        ),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(prod.imageUrl, width: 64, height: 64, fit: BoxFit.cover),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(prod.title, style: AppTypography.labelLarge, maxLines: 1),
                                  const SizedBox(height: 2),
                                  Text('โดย ${prod.artisanName}', style: AppTypography.labelSmall),
                                  const SizedBox(height: 4),
                                  Text('฿${prod.price}',
                                      style: AppTypography.titleMedium.copyWith(color: AppColors.accent, fontSize: 14)),
                                ],
                              ),
                            ),
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
    );
  }
}
