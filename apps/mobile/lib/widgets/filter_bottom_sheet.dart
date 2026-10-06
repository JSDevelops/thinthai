import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';

class FilterBottomSheet extends StatefulWidget {
  final double currentMaxPrice;
  final String selectedRegion;
  final Function(double maxPrice, String region) onApply;

  const FilterBottomSheet({
    super.key,
    required this.currentMaxPrice,
    required this.selectedRegion,
    required this.onApply,
  });

  static void show(
    BuildContext context, {
    required double currentMaxPrice,
    required String selectedRegion,
    required Function(double maxPrice, String region) onApply,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => FilterBottomSheet(
        currentMaxPrice: currentMaxPrice,
        selectedRegion: selectedRegion,
        onApply: onApply,
      ),
    );
  }

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  late double _maxPrice;
  late String _region;

  final List<String> _regions = ['ทุกภาค', 'ภาคเหนือ', 'ภาคกลาง', 'ภาคอีสาน', 'ภาคใต้', 'ภาคตะวันออก'];

  @override
  void initState() {
    super.initState();
    _maxPrice = widget.currentMaxPrice;
    _region = widget.selectedRegion;
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,###', 'th');

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 18),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('ตัวกรองการค้นหา', style: AppTypography.titleLarge.copyWith(fontSize: 20)),
              TextButton(
                onPressed: () {
                  setState(() {
                    _maxPrice = 5000;
                    _region = 'ทุกภาค';
                  });
                },
                child: const Text('ล้างตัวกรอง', style: TextStyle(color: AppColors.textMuted)),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Budget Slider
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('งบประมาณสูงสุดต่อคน', style: AppTypography.labelLarge),
              Text(
                '฿${currencyFormatter.format(_maxPrice.toInt())}',
                style: AppTypography.titleMedium.copyWith(color: AppColors.accent),
              ),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppColors.accent,
              inactiveTrackColor: AppColors.border,
              thumbColor: AppColors.accent,
              overlayColor: AppColors.accent.withValues(alpha: 0.15),
            ),
            child: Slider(
              min: 1000,
              max: 6000,
              divisions: 25,
              value: _maxPrice,
              onChanged: (val) {
                HapticFeedback.selectionClick();
                setState(() => _maxPrice = val);
              },
            ),
          ),
          const SizedBox(height: 16),

          // Region Choice
          Text('ภูมิภาค', style: AppTypography.labelLarge),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _regions.map((r) {
              final isSelected = _region == r;
              return ChoiceChip(
                label: Text(r),
                selected: isSelected,
                onSelected: (selected) {
                  if (selected) setState(() => _region = r);
                },
                selectedColor: AppColors.primary,
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : AppColors.textMain,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                ),
                backgroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: isSelected ? AppColors.primary : AppColors.border),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 28),

          // Apply Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                HapticFeedback.lightImpact();
                widget.onApply(_maxPrice, _region);
                Navigator.pop(context);
              },
              child: const Text('ดูผลการค้นหา'),
            ),
          ),
        ],
      ),
    );
  }
}
