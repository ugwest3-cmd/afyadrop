import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../core/api.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key, required this.api});
  final AfyaDropApi api;

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<Map<String, dynamic>> items = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final result = await widget.api.history();
      if (mounted) setState(() => items = result);
    } catch (e) {
      if (mounted) setState(() => items = []);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('History')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : items.isEmpty
              ? const Center(child: Text('No questions yet.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final item = items[index];
                    return Card(
                      child: ListTile(
                        title: Text(item['question']?.toString() ?? ''),
                        subtitle: Text(item['created_at']?.toString() ?? ''),
                        onTap: () {
                          Navigator.of(context).push(MaterialPageRoute(
                            builder: (_) => HistoryDetailScreen(api: widget.api, item: item),
                          ));
                        },
                      ),
                    );
                  },
                ),
    );
  }
}

class HistoryDetailScreen extends StatelessWidget {
  const HistoryDetailScreen({super.key, required this.api, required this.item});
  final AfyaDropApi api;
  final Map<String, dynamic> item;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Answer')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(item['question']?.toString() ?? '', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 4),
            Text(item['created_at']?.toString() ?? '', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 16),
            Card(child: Padding(padding: const EdgeInsets.all(16), child: MarkdownBody(data: item['answer']?.toString() ?? ''))),
          ],
        ),
      ),
    );
  }
}
