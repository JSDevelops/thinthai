import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';

class CategoryChipData {
  final String label;
  final IconData icon;

  const CategoryChipData(this.label, this.icon);
}

class CategoryChipsList extends StatelessWidget {
  final List<CategoryChipData> categories;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  const CategoryChipsList({
    super.key,
    required this.categories,
    required this.selectedIndex,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final item = categories[index];
          final isSelected = selectedIndex == index;

          return GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              onSelected(index);
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOut,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                  width: 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.25),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        )
                      ]
                    : null,
              ),
              child: Row(
                children: [
                  Icon(
                    item.icon,
                    size: 18,
                    color: isSelected ? Colors.white : AppColors.textMuted,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    item.label,
                    style: AppTypography.labelLarge.copyWith(
                      color: isSelected ? Colors.white : AppColors.textMain,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
