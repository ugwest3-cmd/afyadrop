import 'package:flutter/material.dart';
import '../../../core/design_system.dart';
import '../../../core/widgets/afya_badge.dart';
import '../../../core/widgets/afya_card.dart';
import '../../../core/widgets/afya_disclaimer.dart';
import '../../../core/widgets/afya_input.dart';

class DrugCalculatorScreen extends StatefulWidget {
  const DrugCalculatorScreen({super.key});

  @override
  State<DrugCalculatorScreen> createState() => _DrugCalculatorScreenState();
}

class _DrugCalculatorScreenState extends State<DrugCalculatorScreen> {
  double _weight = 15.0;
  int _age = 5;
  bool _renalToggle = false;
  String? _selectedDrug;

  static const _drugs = ['Artemether/Lumefantrine', 'Ampicillin', 'Gentamicin', 'Paracetamol', 'ORS'];

  static const _emergencyStatDrugs = [
    {'name': 'Adrenaline', 'dose': '0.01 mg/kg', 'route': 'IM/IO'},
    {'name': 'Amiodarone', 'dose': '5 mg/kg', 'route': 'IV'},
    {'name': 'Atropine', 'dose': '0.02 mg/kg', 'route': 'IV/IO'},
  ];

  @override
  Widget build(BuildContext context) {
    final weightLabel = '${_weight.toStringAsFixed(1)} kg';
    final ageLabel = '$_age years';

    return Scaffold(
      backgroundColor: AfyaColors.background,
      appBar: AppBar(
        title: const Text('Dose Calculator'),
        actions: [
          IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.of(context).pop()),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AfyaSpacing.md),
          children: [
            AfyaDisclaimer(
              title: 'Context Advisory',
              message: 'Doses are calculated per MOH guidelines. Always verify weight and renal function.',
            ),
            const SizedBox(height: AfyaSpacing.lg),
            Text('Patient Profile', style: AfyaTextStyles.titleMedium),
            const SizedBox(height: AfyaSpacing.sm),
            AfyaCard(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          const Icon(Icons.cake_rounded, color: AfyaColors.primary, size: 20),
                          const SizedBox(height: 4),
                          Text(ageLabel, style: AfyaTextStyles.titleSmall),
                          Text('Age', style: AfyaTextStyles.bodySmall),
                        ],
                      ),
                      Column(
                        children: [
                          const Icon(Icons.monitor_weight_rounded, color: AfyaColors.primary, size: 20),
                          const SizedBox(height: 4),
                          Text(weightLabel, style: AfyaTextStyles.titleSmall),
                          Text('Weight', style: AfyaTextStyles.bodySmall),
                        ],
                      ),
                      Column(
                        children: [
                          Icon(Icons.calculate_rounded, color: AfyaColors.secondary, size: 20),
                          const SizedBox(height: 4),
                          Text('~${(_weight * 4).toInt()} mL', style: AfyaTextStyles.titleSmall),
                          Text('APLS Est.', style: AfyaTextStyles.bodySmall),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Weight (kg)', style: AfyaTextStyles.labelMedium),
                            Slider(
                              value: _weight,
                              min: 2,
                              max: 80,
                              divisions: 78,
                              label: weightLabel,
                              onChanged: (value) => setState(() => _weight = value),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.remove_rounded),
                        onPressed: () => setState(() => _weight = (_weight - 1).clamp(2, 80)),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add_rounded),
                        onPressed: () => setState(() => _weight = (_weight + 1).clamp(2, 80)),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Renal impairment', style: AfyaTextStyles.labelMedium),
                      Switch(
                        value: _renalToggle,
                        onChanged: (value) => setState(() => _renalToggle = value),
                        activeColor: AfyaColors.primary,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AfyaSpacing.lg),
            Text('Select Drug', style: AfyaTextStyles.titleMedium),
            const SizedBox(height: AfyaSpacing.sm),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _drugs.map((drug) {
                final isSelected = _selectedDrug == drug;
                return FilterChip(
                  label: Text(drug),
                  selected: isSelected,
                  onSelected: (value) => setState(() => _selectedDrug = value ? drug : null),
                  selectedColor: AfyaColors.primary,
                  checkmarkColor: Colors.white,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AfyaColors.onSurface,
                  ),
                );
              }).toList(),
            ),
            if (_selectedDrug != null) ...[
              const SizedBox(height: AfyaSpacing.lg),
              Text('Selected Drug Decision', style: AfyaTextStyles.titleMedium),
              const SizedBox(height: AfyaSpacing.sm),
              AfyaCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(_selectedDrug!, style: AfyaTextStyles.titleSmall),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AfyaColors.secondary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(AfyaRadius.full),
                          ),
                          child: Text(
                            'Malaria',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AfyaColors.secondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            children: [
                              Text('Computed Dose', style: AfyaTextStyles.labelMedium),
                              const SizedBox(height: 4),
                              Text('${(_weight * 3).toInt()} mg', style: AfyaTextStyles.headlineSmall.copyWith(color: AfyaColors.primary)),
                            ],
                          ),
                        ),
                        Container(
                          width: 1,
                          height: 40,
                          color: AfyaColors.outline,
                        ),
                        Expanded(
                          child: Column(
                            children: [
                              Text('Volume (10 mg/mL)', style: AfyaTextStyles.labelMedium),
                              const SizedBox(height: 4),
                              Text('${((_weight * 3) / 10).toStringAsFixed(1)} mL', style: AfyaTextStyles.headlineSmall.copyWith(color: AfyaColors.primary)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      height: 80,
                      decoration: BoxDecoration(
                        color: AfyaColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(AfyaRadius.md),
                        border: Border.all(color: AfyaColors.outline),
                      ),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.vaccines_rounded, size: 24, color: AfyaColors.primary),
                            const SizedBox(height: 4),
                            Text('Syringe Visualizer', style: AfyaTextStyles.labelSmall),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: AfyaSpacing.lg),
            Text('Emergency Stat Drugs', style: AfyaTextStyles.titleMedium),
            const SizedBox(height: AfyaSpacing.sm),
            ..._emergencyStatDrugs.map((drug) {
              return AfyaCard(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  dense: true,
                  leading: const Icon(Icons.emergency_rounded, color: AfyaColors.error, size: 20),
                  title: Text(drug['name'] as String, style: AfyaTextStyles.labelLarge),
                  subtitle: Text('${drug['dose']} - ${drug['route']}', style: AfyaTextStyles.bodySmall),
                ),
              );
            }),
            const SizedBox(height: AfyaSpacing.xxl),
          ],
        ),
      ),
    );
  }
}
