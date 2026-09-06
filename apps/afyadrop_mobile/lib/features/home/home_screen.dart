import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/api.dart';
import '../history/history_screen.dart';
import '../wallet/wallet_screen.dart';
import '../profile/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.api});
  final AfyaDropApi api;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final question = TextEditingController();
  Map<String, dynamic>? profile;
  List<Map<String, dynamic>> history = [];
  String? answer;
  String? error;
  bool loading = true;
  bool asking = false;
  String? selectedImageUrl;

  @override
  void initState() {
    super.initState();
    refresh();
  }

  Future<void> refresh() async {
    try {
      final profileResult = await widget.api.me();
      final historyResult = await widget.api.history();
      if (mounted) {
        setState(() {
          profile = Map<String, dynamic>.from(profileResult['user'] ?? {});
          history = historyResult;
          loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          loading = false;
          error = e.toString();
        });
      }
    }
  }

  Future<void> ask() async {
    if (question.text.trim().isEmpty) return;
    setState(() {
      asking = true;
      error = null;
      answer = null;
    });
    try {
      final result = await widget.api.ask(question.text.trim(), imageUrl: selectedImageUrl);
      if (mounted) {
        setState(() {
          answer = result['answer']?.toString();
          question.clear();
          selectedImageUrl = null;
        });
        await refresh();
      }
    } catch (e) {
      final message = await widget.api.errorMessage(e) ?? e.toString();
      if (mounted) setState(() => error = message);
    } finally {
      if (mounted) setState(() => asking = false);
    }
  }

  Future<void> pickImage() async {
    try {
      final picker = ImagePicker();
      final file = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1024, maxHeight: 1024, imageQuality: 85);
      if (file == null) return;

      final bytes = await file.readAsBytes();
      final fileName = 'lab-reports/${DateTime.now().millisecondsSinceEpoch}-${file.name}';
      await Supabase.instance.client.storage.from('lab-reports').uploadBinary(fileName, bytes, fileOptions: const FileOptions(upsert: true));
      final publicUrl = Supabase.instance.client.storage.from('lab-reports').getPublicUrl(fileName);
      if (mounted) {
        setState(() => selectedImageUrl = publicUrl);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to upload image: $e')));
      }
    }
  }

  void _showHistoryItem(Map<String, dynamic> item) {
    setState(() => answer = item['answer']?.toString());
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final balance = profile?['balance_credits'] ?? 0;
    return Scaffold(
      appBar: AppBar(
        title: const Text('AfyaDrop'),
        actions: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Center(child: Text('$balance credits')),
          ),
          IconButton(icon: const Icon(Icons.history), onPressed: () {
            Navigator.of(context).push(MaterialPageRoute(builder: (_) => HistoryScreen(api: widget.api)));
          }),
          IconButton(icon: const Icon(Icons.account_balance_wallet), onPressed: () {
            Navigator.of(context).push(MaterialPageRoute(builder: (_) => WalletScreen(api: widget.api)));
          }),
          IconButton(icon: const Icon(Icons.person), onPressed: () {
            Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProfileScreen(api: widget.api)));
          }),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: refresh,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Text('Clinical decision support', style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 6),
                  const Text('Ask a question and receive an answer grounded in available African clinical guidelines.'),
                  const SizedBox(height: 16),
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.document_scanner_outlined),
                      title: const Text('Read lab and scan reports'),
                      subtitle: Text(selectedImageUrl != null ? 'Image attached' : 'Upload and interpret clinical reports in the app.'),
                      trailing: selectedImageUrl != null
                          ? IconButton(icon: const Icon(Icons.close), onPressed: () => setState(() => selectedImageUrl = null))
                          : IconButton(icon: const Icon(Icons.add_a_photo), onPressed: pickImage),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: question,
                    minLines: 3,
                    maxLines: 6,
                    decoration: const InputDecoration(hintText: 'e.g. First-line treatment for severe malaria in a child'),
                  ),
                  const SizedBox(height: 12),
                  FilledButton.icon(onPressed: asking ? null : ask, icon: const Icon(Icons.send), label: Text(asking ? 'Generating...' : 'Ask question')),
                  if (error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error))),
                  if (answer != null) ...[
                    const SizedBox(height: 20),
                    Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                      Text('Answer', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      MarkdownBody(data: answer!),
                      IconButton(icon: const Icon(Icons.copy), onPressed: () {
                        Clipboard.setData(ClipboardData(text: answer!));
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Answer copied')));
                      }),
                    ]))),
                  ],
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Recent questions', style: Theme.of(context).textTheme.titleLarge),
                      TextButton.icon(onPressed: () {
                        Navigator.of(context).push(MaterialPageRoute(builder: (_) => HistoryScreen(api: widget.api)));
                      }, icon: const Icon(Icons.history), label: const Text('View all')),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (history.isEmpty) const Text('Your answered questions will appear here.'),
                  ...history.take(5).map((item) => Card(
                    child: ListTile(
                      title: Text(item['question']?.toString() ?? ''),
                      subtitle: Text(item['created_at']?.toString() ?? ''),
                      onTap: () => _showHistoryItem(item),
                    ),
                  )),
                ],
              ),
            ),
    );
  }
}
