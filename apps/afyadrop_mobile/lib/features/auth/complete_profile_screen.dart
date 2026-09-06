import 'package:flutter/material.dart';
import '../../core/api.dart';
import '../home/home_screen.dart';

class CompleteProfileScreen extends StatefulWidget {
  const CompleteProfileScreen({super.key, required this.api});
  final AfyaDropApi api;

  @override
  State<CompleteProfileScreen> createState() => _CompleteProfileScreenState();
}

class _CompleteProfileScreenState extends State<CompleteProfileScreen> {
  final fullName = TextEditingController();
  final licenceNumber = TextEditingController();
  String? selectedCountry;
  String qualification = 'Doctor';
  bool loading = false;
  String? error;
  List<Map<String, dynamic>> countries = [];

  @override
  void initState() {
    super.initState();
    _loadCountries();
  }

  Future<void> _loadCountries() async {
    try {
      final result = await widget.api.countries();
      final list = List<Map<String, dynamic>>.from(result['countries'] ?? []);
      if (mounted) setState(() => countries = list);
    } catch (e) {
      // ignore
    }
  }

  Future<void> submit() async {
    if (selectedCountry == null) {
      setState(() => error = 'Please select a country');
      return;
    }
    setState(() {
      loading = true;
      error = null;
    });
    try {
      await widget.api.completeProfile({
        'full_name': fullName.text.trim(),
        'country': selectedCountry,
        'qualification': qualification,
        'licence_number': licenceNumber.text.trim(),
      });
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => HomeScreen(api: widget.api)),
      );
    } catch (e) {
      final message = await widget.api.errorMessage(e) ?? e.toString();
      if (mounted) setState(() => error = message);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfffff9ec),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('Complete your profile', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      const Text('Tell us a bit about yourself to get started.'),
                      const SizedBox(height: 24),
                      TextField(controller: fullName, decoration: const InputDecoration(labelText: 'Full name')),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        decoration: const InputDecoration(labelText: 'Country'),
                        items: countries
                            .map((c) => DropdownMenuItem(value: c['code']?.toString(), child: Text(c['name']?.toString() ?? c['code']?.toString() ?? '')))
                            .toList(),
                        onChanged: (value) => setState(() => selectedCountry = value),
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        decoration: const InputDecoration(labelText: 'Qualification'),
                        initialValue: qualification,
                        items: const [
                          DropdownMenuItem(value: 'Doctor', child: Text('Doctor')),
                          DropdownMenuItem(value: 'Clinical Officer', child: Text('Clinical Officer')),
                          DropdownMenuItem(value: 'Nurse', child: Text('Nurse')),
                          DropdownMenuItem(value: 'Pharmacist', child: Text('Pharmacist')),
                          DropdownMenuItem(value: 'Midwife', child: Text('Midwife')),
                          DropdownMenuItem(value: 'Laboratory Technician', child: Text('Laboratory Technician')),
                          DropdownMenuItem(value: 'Other', child: Text('Other')),
                        ],
                        onChanged: (value) => setState(() => qualification = value ?? qualification),
                      ),
                      const SizedBox(height: 12),
                      TextField(controller: licenceNumber, decoration: const InputDecoration(labelText: 'Practising licence number')),
                      if (error != null) ...[
                        const SizedBox(height: 12),
                        Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                      ],
                      const SizedBox(height: 20),
                      FilledButton(onPressed: loading ? null : submit, child: Text(loading ? 'Saving...' : 'Save profile')),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
