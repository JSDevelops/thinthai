import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../models/passport_badge_model.dart';
import 'haptic_tap.dart';

class PassportStampWidget extends StatelessWidget {
  final PassportBadgeModel badge;
  final VoidCallback? onTap;

  const PassportStampWidget({
    super.key,
    required this.badge,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormatter = DateFormat('d MMM yyyy', 'th');

    return HapticTap(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: badge.isUnlocked ? AppColors.surface : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: badge.isUnlocked ? AppColors.goldDark.withValues(alpha: 0.5) : Colors.grey.shade300,
            width: 1.5,
          ),
          boxShadow: badge.isUnlocked
              ? [
                  BoxShadow(
                    color: AppColors.gold.withValues(alpha: 0.15),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Circular Rubber Stamp Graphic
            Container(
              width: 68,
              height: 68,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: badge.isUnlocked ? AppColors.accent : Colors.grey.shade400,
                  width: 2,
                ),
                color: badge.isUnlocked ? AppColors.accent.withValues(alpha: 0.08) : Colors.transparent,
              ),
              child: Center(
                child: Text(
                  badge.isUnlocked ? badge.iconEmoji : '🔒',
                  style: const TextStyle(fontSize: 30),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              badge.title,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.titleMedium.copyWith(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: badge.isUnlocked ? AppColors.textMain : Colors.grey.shade500,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              badge.province,
              style: AppTypography.labelSmall.copyWith(
                color: badge.isUnlocked ? AppColors.primary : Colors.grey.shade400,
              ),
            ),
            if (badge.isUnlocked) ...[
              const SizedBox(height: 4),
              Text(
                dateFormatter.format(badge.earnedDate),
                style: AppTypography.labelSmall.copyWith(
                  fontSize: 10,
                  color: AppColors.textLight,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
