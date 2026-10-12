import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import 'haptic_tap.dart';

class PromptPayQRCard extends StatelessWidget {
  final int amount;
  final String referenceNo;
  final String? qrPayload;
  final bool isSandbox;
  final VoidCallback? onSimulatePay;

  const PromptPayQRCard({
    super.key,
    required this.amount,
    required this.referenceNo,
    this.qrPayload,
    this.isSandbox = true,
    this.onSimulatePay,
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
                Text(
                  isSandbox ? 'Sandbox Mode' : 'ThinThai Verified',
                  style: TextStyle(
                    color: isSandbox ? const Color(0xFFFFB74D) : AppColors.gold,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),

          if (isSandbox)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
              color: const Color(0xFFFFF3E0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.info_outline, size: 14, color: Color(0xFFE65100)),
                  const SizedBox(width: 6),
                  Text(
                    'โหมดทดลองชำระเงิน (Sandbox) — ยังไม่มีการตัดเงินจริง',
                    style: AppTypography.labelSmall.copyWith(
                      color: const Color(0xFFE65100),
                      fontWeight: FontWeight.w600,
                      fontSize: 11,
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

                // Actions: Save QR and (if Sandbox) Simulate Pay
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
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
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: AppColors.primaryContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.download_rounded, size: 16, color: AppColors.primaryDark),
                            const SizedBox(width: 4),
                            Text(
                              'บันทึก QR',
                              style: AppTypography.labelLarge.copyWith(
                                fontSize: 12,
                                color: AppColors.primaryDark,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    if (isSandbox && onSimulatePay != null) ...[
                      const SizedBox(width: 10),
                      HapticTap(
                        onTap: onSimulatePay,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2E7D32),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.check_circle_outline, size: 16, color: Colors.white),
                              const SizedBox(width: 4),
                              Text(
                                'ยืนยันจ่ายเงินจำลอง',
                                style: AppTypography.labelLarge.copyWith(
                                  fontSize: 12,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
