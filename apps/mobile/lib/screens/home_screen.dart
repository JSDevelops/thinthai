import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../data/mock_data.dart';
import '../models/trip_model.dart';
import '../widgets/category_chips.dart';
import '../widgets/haptic_tap.dart';
import '../widgets/trip_card.dart';
import 'community_detail_screen.dart';
import 'trip_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedCategoryIndex = 0;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  final List<CategoryChipData> _categories = const [
    CategoryChipData('ทั้งหมด', Icons.grid_view_rounded),
    CategoryChipData('โฮมสเตย์', Icons.home_work_rounded),
    CategoryChipData('หัตถกรรม', Icons.pan_tool_alt_rounded),
    CategoryChipData('อาหารพื้นบ้าน', Icons.restaurant_rounded),
    CategoryChipData('ธรรมชาติ', Icons.forest_rounded),
  ];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.trim().toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<TripModel> _getFilteredTrips() {
    final selectedCategory = _categories[_selectedCategoryIndex].label;
    return MockData.trips.where((trip) {
      final matchesCategory =
          selectedCategory == 'ทั้งหมด' || trip.category.contains(selectedCategory);
      final matchesSearch = _searchQuery.isEmpty ||
          trip.title.toLowerCase().contains(_searchQuery) ||
          trip.communityName.toLowerCase().contains(_searchQuery) ||
          trip.province.toLowerCase().contains(_searchQuery);
      return matchesCategory && matchesSearch;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final filteredTrips = _getFilteredTrips();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // Top App Bar / Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Search bar & Profile Header
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 50,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(25),
                              border: Border.all(color: AppColors.border),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x0A000000),
                                  blurRadius: 10,
                                  offset: Offset(0, 2),
                                ),
                              ],
                            ),
                            child: TextField(
                              controller: _searchController,
                              decoration: InputDecoration(
                                hintText: 'ค้นหาทริปและชุมชน...',
                                hintStyle: AppTypography.bodyMedium,
                                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary),
                                suffixIcon: _searchQuery.isNotEmpty
                                    ? IconButton(
                                        icon: const Icon(Icons.clear, size: 18),
                                        onPressed: () => _searchController.clear(),
                                      )
                                    : null,
                                border: InputBorder.none,
                                enabledBorder: InputBorder.none,
                                focusedBorder: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Avatar with verified online badge
                        Stack(
                          children: [
                            CircleAvatar(
                              radius: 22,
                              backgroundColor: AppColors.primaryContainer,
                              backgroundImage: const NetworkImage(
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                              ),
                            ),
                            Positioned(
                              top: 2,
                              right: 2,
                              child: Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  color: AppColors.gold,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 1.5),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Greeting
                    Text('สวัสดี กิตติโชติ!', style: AppTypography.titleMedium.copyWith(color: AppColors.textMuted)),
                    const SizedBox(height: 4),
                    Text(
                      'ค้นพบวิถีชุมชนไทย',
                      style: AppTypography.displayLarge.copyWith(fontSize: 26, color: AppColors.textMain),
                    ),
                    const SizedBox(height: 18),
                  ],
                ),
              ),
            ),

            // Category Chips
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child: CategoryChipsList(
                  categories: _categories,
                  selectedIndex: _selectedCategoryIndex,
                  onSelected: (idx) => setState(() => _selectedCategoryIndex = idx),
                ),
              ),
            ),

            // Section: ชุมชนไฮไลท์ (Hero Card Banner)
            if (_searchQuery.isEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: HapticTap(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => TripDetailScreen(trip: MockData.trips.first),
                        ),
                      );
                    },
                    child: Container(
                      height: 200,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(24),
                        image: const DecorationImage(
                          image: NetworkImage(
                            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
                          ),
                          fit: BoxFit.cover,
                        ),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x1F000000),
                            blurRadius: 16,
                            offset: Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Stack(
                        children: [
                          DecoratedBox(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(24),
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.black.withValues(alpha: 0.1),
                                  Colors.black.withValues(alpha: 0.75),
                                ],
                              ),
                            ),
                          ),
                          Positioned(
                            top: 14,
                            left: 14,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: AppColors.accent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                'ทริปแนะนำประจำสัปดาห์',
                                style: AppTypography.labelSmall.copyWith(color: Colors.white),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 16,
                            left: 16,
                            right: 16,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'ดอยหมอกจาง & ไร่ชาอู่หลง',
                                  style: AppTypography.titleLarge.copyWith(color: Colors.white, fontSize: 20),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.location_on, color: AppColors.gold, size: 16),
                                    const SizedBox(width: 4),
                                    Text(
                                      'ดอยแม่สลอง, เชียงราย',
                                      style: AppTypography.bodyMedium.copyWith(color: Colors.white70),
                                    ),
                                    const Spacer(),
                                    Text(
                                      '฿2,800',
                                      style: AppTypography.titleLarge.copyWith(color: AppColors.gold, fontSize: 18),
                                    ),
                                    Text(' / คน', style: AppTypography.labelSmall.copyWith(color: Colors.white70)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

            // Section: ชุมชนแนะนำ (Communities Horizontal List)
            if (_searchQuery.isEmpty) ...[
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 28, 20, 14),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('ชุมชนแนะนำ', style: AppTypography.titleLarge.copyWith(fontSize: 19)),
                      Text(
                        'แตะเพื่อดูเรื่องราว',
                        style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 120,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    scrollDirection: Axis.horizontal,
                    itemCount: MockData.communities.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 14),
                    itemBuilder: (context, idx) {
                      final com = MockData.communities[idx];
                      return HapticTap(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CommunityDetailScreen(community: com),
                            ),
                          );
                        },
                        child: Container(
                          width: 230,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: AppColors.borderLight),
                          ),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(14),
                                child: Image.network(
                                  com.coverImage,
                                  width: 70,
                                  height: 90,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      com.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: AppTypography.titleMedium.copyWith(fontSize: 14),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      com.province,
                                      style: AppTypography.labelSmall.copyWith(color: AppColors.primary),
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      children: [
                                        const Icon(Icons.star_rounded, size: 14, color: AppColors.star),
                                        const SizedBox(width: 2),
                                        Text(
                                          com.rating.toString(),
                                          style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w700),
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
                  ),
                ),
              ),
            ],

            // Section: ทริปและกิจกรรมยอดนิยม
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 14),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _searchQuery.isNotEmpty ? 'ผลการค้นหา' : 'ทริปและกิจกรรมยอดนิยม',
                      style: AppTypography.titleLarge.copyWith(fontSize: 19),
                    ),
                    Text(
                      '${filteredTrips.length} ทริป',
                      style: AppTypography.bodyMedium.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
            ),

            // Trip Cards Vertical List
            if (filteredTrips.isEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 40),
                  child: Center(
                    child: Column(
                      children: [
                        const Icon(Icons.search_off_rounded, size: 48, color: Colors.grey),
                        const SizedBox(height: 12),
                        Text('ไม่พบทริปที่ตรงกับการค้นหา', style: AppTypography.titleMedium),
                        const SizedBox(height: 4),
                        Text('ลองค้นหาชื่อชุมชน จังหวัด หรือกิจกรรมอื่น', style: AppTypography.bodyMedium),
                      ],
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 110),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
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
                    childCount: filteredTrips.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
