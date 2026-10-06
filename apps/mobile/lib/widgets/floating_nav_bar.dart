import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/theme/app_colors.dart';
import '../state/app_state.dart';

class FloatingNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const FloatingNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
        child: Container(
          height: 66,
          decoration: BoxDecoration(
            color: AppColors.primaryDark,
            borderRadius: BorderRadius.circular(38),
            boxShadow: const [
              BoxShadow(
                color: Color(0x38000000),
                blurRadius: 24,
                offset: Offset(0, 8),
              ),
              BoxShadow(
                color: Color(0x2600695C),
                blurRadius: 12,
                offset: Offset(0, 4),
              ),
            ],
          ),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.home_rounded, 'หน้าหลัก'),
              _buildNavItem(1, Icons.explore_rounded, 'เที่ยวถิ่น'),
              _buildNavItem(2, Icons.storefront_rounded, 'ช้อปคราฟต์', isMarket: true),
              _buildNavItem(3, Icons.calendar_month_rounded, 'การจอง', isBookings: true),
              _buildNavItem(4, Icons.military_tech_rounded, 'พาสปอร์ต'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    int index,
    IconData icon,
    String label, {
    bool isMarket = false,
    bool isBookings = false,
  }) {
    final bool isSelected = currentIndex == index;

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap(index);
      },
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 14 : 10,
          vertical: 8,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent : Colors.transparent,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedBuilder(
              animation: AppState(),
              builder: (context, _) {
                final cartCount = AppState().cartItemCount;
                final bookingCount = AppState().bookings.length;

                Widget iconWidget = Icon(
                  icon,
                  size: 22,
                  color: isSelected ? Colors.white : const Color(0xFF9CB8AF),
                );

                if (isMarket && cartCount > 0 && !isSelected) {
                  return Badge(
                    label: Text('$cartCount', style: const TextStyle(fontSize: 9)),
                    backgroundColor: AppColors.accent,
                    child: iconWidget,
                  );
                }
                if (isBookings && bookingCount > 0 && !isSelected) {
                  return Badge(
                    label: Text('$bookingCount', style: const TextStyle(fontSize: 9)),
                    backgroundColor: AppColors.goldDark,
                    child: iconWidget,
                  );
                }
                return iconWidget;
              },
            ),
            if (isSelected) ...[
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
