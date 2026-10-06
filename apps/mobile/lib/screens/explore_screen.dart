import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../data/mock_data.dart';
import '../widgets/filter_bottom_sheet.dart';
import '../widgets/trip_card.dart';
import 'trip_detail_screen.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  String _selectedRegion = 'ทุกภาค';
  double _maxPrice = 6000;
  bool _isMapView = false;
  final List<String> _regions = ['ทุกภาค', 'ภาคเหนือ', 'ภาคกลาง', 'ภาคอีสาน', 'ภาคใต้', 'ภาคตะวันออก'];

  @override
  Widget build(BuildContext context) {
    final filteredTrips = MockData.trips.where((trip) {
      final matchesRegion = _selectedRegion == 'ทุกภาค' || trip.region == _selectedRegion;
      final matchesPrice = trip.pricePerPerson <= _maxPrice;
      return matchesRegion && matchesPrice;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('สำรวจทริปถึงถิ่น', style: AppTypography.titleLarge),
        centerTitle: false,
        actions: [
          IconButton(
            icon: Icon(_isMapView ? Icons.format_list_bulleted_rounded : Icons.map_outlined, color: AppColors.primary),
            onPressed: () {
              HapticFeedback.lightImpact();
              setState(() => _isMapView = !_isMapView);
            },
          ),
          IconButton(
            icon: const Icon(Icons.tune_rounded, color: AppColors.primary),
            onPressed: () {
              HapticFeedback.lightImpact();
              FilterBottomSheet.show(
                context,
                currentMaxPrice: _maxPrice,
                selectedRegion: _selectedRegion,
                onApply: (price, reg) {
                  setState(() {
                    _maxPrice = price;
                    _selectedRegion = reg;
                  });
                },
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Region Selector Chips
          SizedBox(
            height: 40,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              scrollDirection: Axis.horizontal,
              itemCount: _regions.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, idx) {
                final region = _regions[idx];
                final isSelected = _selectedRegion == region;
                return ChoiceChip(
                  label: Text(region),
                  selected: isSelected,
                  onSelected: (val) {
                    if (val) {
                      HapticFeedback.lightImpact();
                      setState(() => _selectedRegion = region);
                    }
                  },
                  selectedColor: AppColors.primary,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textMain,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  ),
                  backgroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(color: isSelected ? AppColors.primary : AppColors.border),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),

          // Map View or List View
          if (_isMapView)
            Expanded(
              child: Stack(
                children: [
                  Container(
                    margin: const EdgeInsets.fromLTRB(20, 0, 20, 110),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceTinted,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.travel_explore_rounded, size: 64, color: AppColors.primary),
                          const SizedBox(height: 12),
                          Text('แผนที่พิกัดท่องเที่ยวชุมชนทั่วไทย', style: AppTypography.titleMedium),
                          const SizedBox(height: 6),
                          Text('พบหมุดชุมชนทั้งหมด ${MockData.communities.length} แห่งในระบบ',
                              style: AppTypography.bodyMedium),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            )
          else
            Expanded(
              child: filteredTrips.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.travel_explore_rounded, size: 56, color: Colors.grey),
                          const SizedBox(height: 12),
                          Text('ไม่พบทริปในงบประมาณหรือภาคที่เลือก', style: AppTypography.titleMedium),
                          const SizedBox(height: 4),
                          Text('ลองปรับขยายงบประมาณในการค้นหา', style: AppTypography.bodyMedium),
                        ],
                      ),
                    )
                  : ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 110),
                      itemCount: filteredTrips.length,
                      itemBuilder: (context, index) {
                        final trip = filteredTrips[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 18),
                          child: TripCard(
                            trip: trip,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => TripDetailScreen(trip: trip),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    ),
            ),
        ],
      ),
    );
  }
}
