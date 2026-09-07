import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../design_system.dart';

class AfyaInput extends StatelessWidget {
  const AfyaInput({
    super.key,
    this.controller,
    this.label,
    this.hintText,
    this.prefixIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.enabled = true,
    this.readOnly = false,
    this.keyboardType,
    this.textInputAction,
    this.onTap,
    this.onChanged,
    this.onFieldSubmitted,
    this.validator,
    this.errorText,
    this.maxLines,
    this.minLines,
    this.maxLength,
    this.inputFormatters,
  });

  final TextEditingController? controller;
  final String? label;
  final String? hintText;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final bool obscureText;
  final bool enabled;
  final bool readOnly;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final VoidCallback? onTap;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onFieldSubmitted;
  final String? Function(String?)? validator;
  final String? errorText;
  final int? maxLines;
  final int? minLines;
  final int? maxLength;
  final List<TextInputFormatter>? inputFormatters;

  @override
  Widget build(BuildContext context) {
    final effectiveEnabled = enabled && !readOnly;
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      enabled: effectiveEnabled,
      readOnly: readOnly,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      onTap: onTap,
      onChanged: onChanged,
      onFieldSubmitted: onFieldSubmitted,
      validator: validator,
      maxLines: maxLines ?? 1,
      minLines: minLines,
      maxLength: maxLength,
      inputFormatters: inputFormatters,
      decoration: InputDecoration(
        labelText: label,
        hintText: hintText,
        prefixIcon: prefixIcon,
        suffixIcon: suffixIcon,
        errorText: errorText,
        filled: true,
        fillColor: effectiveEnabled ? AfyaColors.surface : AfyaColors.surfaceVariant,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AfyaRadius.md),
          borderSide: const BorderSide(color: AfyaColors.outline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AfyaRadius.md),
          borderSide: const BorderSide(color: AfyaColors.outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AfyaRadius.md),
          borderSide: const BorderSide(color: AfyaColors.primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      style: TextStyle(
        fontFamily: AfyaTextStyles.bodyFont,
        fontSize: 15,
        color: effectiveEnabled ? AfyaColors.onSurface : AfyaColors.onSurface.withOpacity(0.5),
      ),
    );
  }
}
