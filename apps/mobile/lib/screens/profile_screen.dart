import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../data/mock_data.dart';
import '../state/app_state.dart';
import '../widgets/passport_stamp_widget.dart';
import '../widgets/trip_card.dart';
import '../models/passport_badge_model.dart';
import 'trip_detail_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,###', 'th');

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('พาสปอร์ตนักเดินทาง', style: AppTypography.titleLarge),
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark_border_rounded, color: AppColors.primary),
            onPressed: () => _showSavedTripsSheet(context),
          ),
          IconButton(icon: const Icon(Icons.settings_outlined), onPressed: () {}),
        ],
      ),
      body: AnimatedBuilder(
        animation: AppState(),
        builder: (context, _) {
          return ListView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 110),
            children: [
              // Profile Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.borderLight),
                  boxShadow: const [
                    BoxShadow(color: Color(0x0A000000), blurRadius: 10, offset: Offset(0, 4)),
                  ],
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundColor: AppColors.primaryContainer,
                      backgroundImage: const NetworkImage(
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('กิตติโชติ รัตนชัย', style: AppTypography.titleLarge.copyWith(fontSize: 18)),
                          const SizedBox(height: 2),
                          Text('นักเดินทางสายชุมชนระดับ 3',
                              style: AppTypography.labelSmall.copyWith(color: AppColors.primary)),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.gold.withValues(alpha: 0.25),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '🌟 Local Champion Explorer',
                              style: AppTypography.labelSmall.copyWith(
                                color: AppColors.goldDark,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Impact Counter Cards
              Text('คุณค่าที่คุณร่วมสร้างให้ชุมชน', style: AppTypography.titleMedium),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildMetricTile(
                      title: 'ชุมชนที่สนับสนุน',
                      value: '${AppState().supportedVillagesCount} แห่ง',
                      icon: Icons.holiday_village_rounded,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildMetricTile(
                      title: 'ร่วมปลูกป่าชุมชน',
                      value: '${AppState().treesContributed} ต้น',
                      icon: Icons.park_rounded,
                      color: AppColors.accent,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildMetricTile(
                      title: 'คืนสู่ชาวบ้าน',
                      value: '฿${currencyFormatter.format(AppState().totalSpentInCommunities)}',
                      icon: Icons.volunteer_activism_rounded,
                      color: AppColors.primaryDark,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Passport Stamps Grid
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('ตราประทับชุมชนที่สะสม (Stamps)', style: AppTypography.titleMedium),
                  Text(
                    '${AppState().badges.where((b) => b.isUnlocked).length}/${AppState().badges.length} ตรา',
                    style: AppTypography.labelSmall.copyWith(color: AppColors.primary),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.95,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: AppState().badges.length,
                itemBuilder: (context, index) {
                  final badge = AppState().badges[index];
                  return PassportStampWidget(
                    badge: badge,
                    onTap: () {
                      _showStampDetail(context, badge);
                    },
                  );
                },
              ),
              const SizedBox(height: 24),

              // Menu Options
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  children: [
                    _buildMenuItem(
                      Icons.bookmark_rounded,
                      'ทริปที่บันทึกไว้ (${AppState().bookmarkedTripIds.length})',
                      onTap: () => _showSavedTripsSheet(context),
                    ),
                    const Divider(height: 1, indent: 56, color: AppColors.borderLight),
                    _buildMenuItem(
                      Icons.storefront_rounded,
                      'สมัครเป็นผู้ประกอบการชุมชน ThinThai',
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('เปิดฟอร์มลงทะเบียนผู้ประกอบการชุมชน')),
                        );
                      },
                    ),
                    const Divider(height: 1, indent: 56, color: AppColors.borderLight),
                    _buildMenuItem(
                      Icons.help_outline_rounded,
                      'ข้อแนะนำและคู่มือนักท่องเที่ยวชุมชน',
                      onTap: () {},
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  void _showStampDetail(BuildContext context, PassportBadgeModel badge) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(badge.iconEmoji, style: const TextStyle(fontSize: 48)),
              const SizedBox(height: 14),
              Text(badge.title, style: AppTypography.titleMedium.copyWith(fontSize: 18), textAlign: TextAlign.center),
              const SizedBox(height: 4),
              Text('${badge.communityName}, จ.${badge.province}',
                  style: AppTypography.labelLarge.copyWith(color: AppColors.primary)),
              const SizedBox(height: 12),
              Text(badge.description, textAlign: TextAlign.center, style: AppTypography.bodyMedium),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('ปิด'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSavedTripsSheet(BuildContext context) {
    final bookmarkedTrips = MockData.trips
        .where((t) => AppState().bookmarkedTripIds.contains(t.id))
        .toList();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.75,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
        child: Column(
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            Text('ทริปที่บันทึกไว้ (${bookmarkedTrips.length})', style: AppTypography.titleLarge),
            const SizedBox(height: 16),
            Expanded(
              child: bookmarkedTrips.isEmpty
                  ? Center(child: Text('ยังไม่มีทริปที่บันทึกไว้', style: AppTypography.bodyMedium))
                  : ListView.builder(
                      itemCount: bookmarkedTrips.length,
                      itemBuilder: (context, index) {
                        final trip = bookmarkedTrips[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: TripCard(
                            trip: trip,
                            onTap: () {
                              Navigator.pop(ctx);
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => TripDetailScreen(trip: trip)),
                              );
                            },
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricTile({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(value, style: AppTypography.titleMedium.copyWith(fontSize: 15, color: color, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(title, style: AppTypography.labelSmall.copyWith(fontSize: 10), maxLines: 1),
        ],
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, {required VoidCallback onTap}) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(title, style: AppTypography.bodyMedium.copyWith(color: AppColors.textMain, fontWeight: FontWeight.w500)),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textLight),
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
    );
  }
}
