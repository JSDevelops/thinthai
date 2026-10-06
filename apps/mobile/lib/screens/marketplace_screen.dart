import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../data/mock_data.dart';
import '../models/community_model.dart';
import '../state/app_state.dart';
import '../widgets/haptic_tap.dart';
import '../widgets/promptpay_qr_card.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  String _selectedCategory = 'ทั้งหมด';
  final List<String> _categories = [
    'ทั้งหมด',
    'อาหารและชา',
    'ผ้าทอและเครื่องแต่งกาย',
    'เครื่องหอมและสบู่',
    'งานจักสาน'
  ];

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,###', 'th');

    final filteredProducts = _selectedCategory == 'ทั้งหมด'
        ? MockData.products
        : MockData.products.where((p) => p.category == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('ช้อปของดีชุมชน', style: AppTypography.titleLarge),
        actions: [
          AnimatedBuilder(
            animation: AppState(),
            builder: (context, _) {
              final count = AppState().cartItemCount;
              return Stack(
                alignment: Alignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_bag_outlined, color: AppColors.primary, size: 26),
                    onPressed: () => _showCartSheet(context),
                  ),
                  if (count > 0)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColors.accent,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '$count',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Category Selector
          SizedBox(
            height: 42,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, idx) {
                final cat = _categories[idx];
                final isSelected = _selectedCategory == cat;
                return ChoiceChip(
                  label: Text(cat),
                  selected: isSelected,
                  onSelected: (val) {
                    if (val) {
                      HapticFeedback.lightImpact();
                      setState(() => _selectedCategory = cat);
                    }
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
              },
            ),
          ),
          const SizedBox(height: 12),

          // Products Grid
          Expanded(
            child: GridView.builder(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 110),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.68,
                crossAxisSpacing: 14,
                mainAxisSpacing: 16,
              ),
              itemCount: filteredProducts.length,
              itemBuilder: (context, index) {
                final product = filteredProducts[index];
                return _buildProductCard(context, product, currencyFormatter);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(BuildContext context, ProductModel product, NumberFormat currencyFormatter) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: const [
          BoxShadow(color: Color(0x0A000000), blurRadius: 10, offset: Offset(0, 4)),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          AspectRatio(
            aspectRatio: 1.15,
            child: Image.network(
              product.imageUrl,
              fit: BoxFit.cover,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.province,
                  style: AppTypography.labelSmall.copyWith(color: AppColors.primary, fontSize: 11),
                ),
                const SizedBox(height: 2),
                Text(
                  product.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.titleMedium.copyWith(fontSize: 13, height: 1.25),
                ),
                const SizedBox(height: 4),
                Text(
                  'โดย ${product.artisanName}',
                  maxLines: 1,
                  style: AppTypography.labelSmall.copyWith(fontSize: 10),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '฿${currencyFormatter.format(product.price)}',
                      style: AppTypography.titleMedium.copyWith(color: AppColors.accent, fontSize: 15),
                    ),
                    HapticTap(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        AppState().addToCart(product);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('เพิ่ม "${product.title}" ลงในตะกร้าแล้ว'),
                            duration: const Duration(seconds: 1),
                          ),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.add_shopping_cart_rounded, color: Colors.white, size: 16),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showCartSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _CartBottomSheet(),
    );
  }
}

class _CartBottomSheet extends StatefulWidget {
  const _CartBottomSheet();

  @override
  State<_CartBottomSheet> createState() => _CartBottomSheetState();
}

class _CartBottomSheetState extends State<_CartBottomSheet> {
  bool _showPromptPay = false;

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,###', 'th');

    return AnimatedBuilder(
      animation: AppState(),
      builder: (context, _) {
        final cart = AppState().cart;
        final total = AppState().cartTotalPrice;

        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
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
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 16),

              if (_showPromptPay) ...[
                PromptPayQRCard(
                  amount: total,
                  referenceNo: 'ORD-${DateTime.now().millisecondsSinceEpoch.toString().substring(6)}',
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      AppState().clearCart();
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('คำสั่งซื้อสำเร็จ! ผู้ผลิตชุมชนกำลังเตรียมจัดส่งให้คุณ')),
                      );
                    },
                    child: const Text('ยืนยันชำระเงินเรียบร้อย'),
                  ),
                ),
              ] else ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('ตะกร้าของดีชุมชน (${AppState().cartItemCount})',
                        style: AppTypography.titleLarge.copyWith(fontSize: 18)),
                    if (cart.isNotEmpty)
                      TextButton(
                        onPressed: () => AppState().clearCart(),
                        child: const Text('ล้างตะกร้า', style: TextStyle(color: Colors.red)),
                      ),
                  ],
                ),
                const SizedBox(height: 12),

                if (cart.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 40),
                    child: Center(
                      child: Column(
                        children: [
                          const Icon(Icons.shopping_bag_outlined, size: 56, color: Colors.grey),
                          const SizedBox(height: 10),
                          Text('ยังไม่มีสินค้าในตะกร้า', style: AppTypography.bodyMedium),
                        ],
                      ),
                    ),
                  )
                else
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxHeight: 280),
                    child: ListView.separated(
                      shrinkWrap: true,
                      itemCount: cart.length,
                      separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.borderLight),
                      itemBuilder: (context, index) {
                        final item = cart[index];
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: Image.network(item.product.imageUrl, width: 48, height: 48, fit: BoxFit.cover),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.product.title,
                                        maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTypography.labelLarge),
                                    Text('฿${currencyFormatter.format(item.product.price)}',
                                        style: AppTypography.labelSmall.copyWith(color: AppColors.accent)),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.remove, size: 16),
                                    onPressed: () => AppState().updateCartQuantity(item.product.id, item.quantity - 1),
                                  ),
                                  Text('${item.quantity}', style: AppTypography.titleMedium.copyWith(fontSize: 14)),
                                  IconButton(
                                    icon: const Icon(Icons.add, size: 16),
                                    onPressed: () => AppState().updateCartQuantity(item.product.id, item.quantity + 1),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),

                if (cart.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('ยอดรวม (รายได้ส่งตรงถึงชุมชน 100%)', style: AppTypography.labelSmall),
                      Text(
                        '฿${currencyFormatter.format(total)}',
                        style: AppTypography.titleLarge.copyWith(color: AppColors.accent),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => setState(() => _showPromptPay = true),
                      child: const Text('ชำระเงินผ่าน PromptPay QR'),
                    ),
                  ),
                ],
              ],
            ],
          ),
        );
      },
    );
  }
}
