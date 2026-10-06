import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../models/trip_model.dart';
import '../state/app_state.dart';
import 'promptpay_qr_card.dart';

class BookingBottomSheet extends StatefulWidget {
  final TripModel trip;

  const BookingBottomSheet({super.key, required this.trip});

  static void show(BuildContext context, TripModel trip) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => BookingBottomSheet(trip: trip),
    );
  }

  @override
  State<BookingBottomSheet> createState() => _BookingBottomSheetState();
}

class _BookingBottomSheetState extends State<BookingBottomSheet> {
  int _guestCount = 2;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 7));
  String _paymentMethod = 'promptpay'; // 'promptpay' or 'card'
  bool _isProcessing = false;
  bool _showPromptPayView = false;

  void _onProceedToPay() {
    HapticFeedback.mediumImpact();
    if (_paymentMethod == 'promptpay') {
      setState(() => _showPromptPayView = true);
    } else {
      _executeBooking();
    }
  }

  void _executeBooking() async {
    setState(() => _isProcessing = true);
    HapticFeedback.mediumImpact();
    await Future.delayed(const Duration(milliseconds: 900));
    if (!mounted) return;

    final total = widget.trip.pricePerPerson * _guestCount;
    AppState().addBooking(
      trip: widget.trip,
      travelDate: _selectedDate,
      participantsCount: _guestCount,
      totalPrice: total,
    );

    Navigator.pop(context); // Close bottom sheet
    _showSuccessDialog();
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 68,
                height: 68,
                decoration: const BoxDecoration(
                  color: AppColors.primaryContainer,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 44),
              ),
              const SizedBox(height: 18),
              Text(
                'จองทริปสำเร็จแล้ว!',
                style: AppTypography.titleMedium.copyWith(fontSize: 20),
              ),
              const SizedBox(height: 8),
              Text(
                'บันทึกข้อมูลการเดินทางของคุณแล้ว พร้อมสร้าง QR Code Pass สำหรับเช็กอินกับ ${widget.trip.communityName} เรียบร้อย',
                textAlign: TextAlign.center,
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('ดูตั๋วการเดินทางของฉัน'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,###', 'th');
    final totalAmount = widget.trip.pricePerPerson * _guestCount;
    final dateFormatter = DateFormat('d MMMM yyyy', 'th');

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
          // Drag handle
          Center(
            child: Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 18),

          if (_showPromptPayView) ...[
            // PromptPay Payment View
            PromptPayQRCard(
              amount: totalAmount,
              referenceNo: 'TT-${DateTime.now().millisecondsSinceEpoch.toString().substring(6)}',
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _showPromptPayView = false),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('ย้อนกลับ'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isProcessing ? null : _executeBooking,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.accent,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: _isProcessing
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Text('ชำระเงินเรียบร้อยแล้ว'),
                  ),
                ),
              ],
            ),
          ] else ...[
            // Main Booking Selection View
            Text(
              'จองทริปท่องเที่ยวชุมชน',
              style: AppTypography.titleLarge.copyWith(fontSize: 20),
            ),
            Text(
              widget.trip.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.bodyMedium.copyWith(color: AppColors.textMuted),
            ),
            const SizedBox(height: 20),

            // Date Picker Tile
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.calendar_today_rounded, size: 20, color: AppColors.primary),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('วันที่ออกเดินทาง', style: AppTypography.labelSmall),
                          Text(
                            dateFormatter.format(_selectedDate),
                            style: AppTypography.labelLarge,
                          ),
                        ],
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _selectedDate,
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 90)),
                      );
                      if (picked != null) setState(() => _selectedDate = picked);
                    },
                    child: const Text('เปลี่ยนวัน', style: TextStyle(color: AppColors.primary)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Guest Counter
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('จำนวนผู้ร่วมเดินทาง', style: AppTypography.labelLarge),
                      Text('฿${currencyFormatter.format(widget.trip.pricePerPerson)} ต่อคน',
                          style: AppTypography.bodyMedium.copyWith(fontSize: 12)),
                    ],
                  ),
                  Row(
                    children: [
                      IconButton.filledTonal(
                        icon: const Icon(Icons.remove, size: 18),
                        onPressed: _guestCount > 1
                            ? () {
                                HapticFeedback.selectionClick();
                                setState(() => _guestCount--);
                              }
                            : null,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          '$_guestCount คน',
                          style: AppTypography.titleMedium.copyWith(fontSize: 16),
                        ),
                      ),
                      IconButton.filledTonal(
                        icon: const Icon(Icons.add, size: 18),
                        onPressed: _guestCount < 10
                            ? () {
                                HapticFeedback.selectionClick();
                                setState(() => _guestCount++);
                              }
                            : null,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Payment Option Selector
            Text('วิธีชำระเงิน', style: AppTypography.labelLarge),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _paymentMethod = 'promptpay'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: _paymentMethod == 'promptpay' ? AppColors.primaryContainer : Colors.white,
                        border: Border.all(
                          color: _paymentMethod == 'promptpay' ? AppColors.primary : AppColors.border,
                          width: 1.5,
                        ),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.qr_code_2_rounded, size: 20, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Text('PromptPay QR',
                              style: AppTypography.labelLarge.copyWith(color: AppColors.primary)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _paymentMethod = 'card'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: _paymentMethod == 'card' ? AppColors.primaryContainer : Colors.white,
                        border: Border.all(
                          color: _paymentMethod == 'card' ? AppColors.primary : AppColors.border,
                          width: 1.5,
                        ),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.credit_card_rounded, size: 20, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Text('บัตรเครดิต',
                              style: AppTypography.labelLarge.copyWith(color: AppColors.primary)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),

            // Total and Submit
            Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('ยอดรวมสุทธิ', style: AppTypography.labelSmall),
                    Text(
                      '฿${currencyFormatter.format(totalAmount)}',
                      style: AppTypography.titleLarge.copyWith(
                        color: AppColors.accent,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _onProceedToPay,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.accent,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: Text(
                      _paymentMethod == 'promptpay'
                          ? 'สร้าง QR ชำระเงิน'
                          : 'ยืนยันการจอง (฿${currencyFormatter.format(totalAmount)})',
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
