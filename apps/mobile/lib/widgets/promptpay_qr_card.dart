import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import 'haptic_tap.dart';

class PromptPayQRCard extends StatelessWidget {
  final int amount;
  final String referenceNo;

  const PromptPayQRCard({
    super.key,
    required this.amount,
    required this.referenceNo,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,###', 'th');

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x12000000),
            blurRadius: 18,
            offset: Offset(0, 6),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          // PromptPay Official Blue Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: const Color(0xFF003D6B),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'PromptPay',
                        style: TextStyle(
                          color: Color(0xFF003D6B),
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'พร้อมเพย์ชุมชน',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const Text(
                  'ThinThai Verified',
                  style: TextStyle(
                    color: AppColors.gold,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Text(
                  'สแกน QR เพื่อชำระเงิน',
                  style: AppTypography.titleMedium.copyWith(fontSize: 15),
                ),
                const SizedBox(height: 4),
                Text(
                  '฿${currencyFormatter.format(amount)} THB',
                  style: AppTypography.displayLarge.copyWith(
                    fontSize: 26,
                    color: AppColors.primary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 16),

                // QR Graphic
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderLight, width: 2),
                  ),
                  child: const Icon(
                    Icons.qr_code_2_rounded,
                    size: 160,
                    color: Color(0xFF173832),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'เลขอ้างอิง: $referenceNo',
                  style: AppTypography.labelSmall.copyWith(letterSpacing: 1.2),
                ),
                const SizedBox(height: 16),

                // Save QR Button
                HapticTap(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('บันทึกรูปภาพ QR Code พร้อมเพย์ลงเครื่องแล้ว'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.download_rounded, size: 18, color: AppColors.primaryDark),
                        const SizedBox(width: 6),
                        Text(
                          'บันทึกภาพ QR Code',
                          style: AppTypography.labelLarge.copyWith(
                            fontSize: 13,
                            color: AppColors.primaryDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
