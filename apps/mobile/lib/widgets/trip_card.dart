import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../models/trip_model.dart';
import '../state/app_state.dart';
import 'haptic_tap.dart';

class TripCard extends StatelessWidget {
  final TripModel trip;
  final VoidCallback onTap;

  const TripCard({
    super.key,
    required this.trip,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,###', 'th');

    return AnimatedBuilder(
      animation: AppState(),
      builder: (context, _) {
        final isBookmarked = AppState().isTripBookmarked(trip.id);

        return HapticTap(
          onTap: onTap,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppColors.borderLight, width: 1),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x0C000000),
                  blurRadius: 16,
                  offset: Offset(0, 6),
                ),
              ],
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image Stack with Rating & Category & Bookmark
                Stack(
                  children: [
                    AspectRatio(
                      aspectRatio: 16 / 9.5,
                      child: Image.network(
                        trip.imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: AppColors.primaryContainer,
                          child: const Center(
                            child: Icon(Icons.landscape, size: 48, color: AppColors.primary),
                          ),
                        ),
                      ),
                    ),
                    // Gradient overlay
                    Positioned.fill(
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withValues(alpha: 0.25),
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.4),
                            ],
                          ),
                        ),
                      ),
                    ),
                    // Rating Badge (Top Left)
                    Positioned(
                      top: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x1F000000),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.star_rounded, size: 16, color: AppColors.star),
                            const SizedBox(width: 4),
                            Text(
                              trip.rating.toString(),
                              style: AppTypography.labelLarge.copyWith(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    // Bookmark Button (Top Right)
                    Positioned(
                      top: 12,
                      right: 12,
                      child: GestureDetector(
                        onTap: () {
                          HapticFeedback.lightImpact();
                          AppState().toggleTripBookmark(trip.id);
                        },
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.9),
                            shape: BoxShape.circle,
                            boxShadow: const [
                              BoxShadow(color: Color(0x1A000000), blurRadius: 6),
                            ],
                          ),
                          child: Icon(
                            isBookmarked ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                            size: 20,
                            color: isBookmarked ? AppColors.accent : AppColors.textMain,
                          ),
                        ),
                      ),
                    ),
                    // Category Chip (Bottom Left of Image)
                    Positioned(
                      bottom: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.goldDark.withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          trip.category,
                          style: AppTypography.labelSmall.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    // Duration badge (Bottom Right of Image)
                    Positioned(
                      bottom: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          trip.durationText,
                          style: AppTypography.labelSmall.copyWith(
                            color: Colors.white,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                // Content Body
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Location pin & Province
                      Row(
                        children: [
                          const Icon(Icons.location_on_rounded, size: 16, color: AppColors.primary),
                          const SizedBox(width: 4),
                          Text(
                            '${trip.communityName}, ${trip.province}',
                            style: AppTypography.labelSmall.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      // Title
                      Text(
                        trip.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.titleMedium.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Divider(height: 1, color: AppColors.borderLight),
                      const SizedBox(height: 12),
                      // Host & Price
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 14,
                                backgroundImage: NetworkImage(trip.hostAvatar),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                trip.hostName,
                                style: AppTypography.bodyMedium.copyWith(
                                  fontSize: 13,
                                  color: AppColors.textMain,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    '฿${currencyFormatter.format(trip.pricePerPerson)}',
                                    style: AppTypography.titleMedium.copyWith(
                                      fontSize: 16,
                                      color: AppColors.accent,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  Text(
                                    ' / คน',
                                    style: AppTypography.labelSmall.copyWith(
                                      color: AppColors.textMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
