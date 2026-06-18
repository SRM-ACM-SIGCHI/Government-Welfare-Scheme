// lib/widgets/skeleton_loader.dart
// Shimmer loading placeholders for scheme cards and content.

import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../constants/app_theme.dart';

class SkeletonSchemeCard extends StatelessWidget {
  const SkeletonSchemeCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: const Color(0xFFF3F4F6),
      highlightColor: const Color(0xFFE5E7EB),
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _Box(width: 220, height: 18),
                  const Spacer(),
                  _Box(width: 72, height: 18, radius: 20),
                ],
              ),
              const SizedBox(height: 10),
              _Box(width: 140, height: 13),
              const SizedBox(height: 14),
              _Box(width: double.infinity, height: 36, radius: 10),
            ],
          ),
        ),
      ),
    );
  }
}

class SkeletonList extends StatelessWidget {
  final int count;
  const SkeletonList({super.key, this.count = 4});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: count,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      itemBuilder: (_, __) => const SkeletonSchemeCard(),
    );
  }
}

class _Box extends StatelessWidget {
  final double width;
  final double height;
  final double radius;

  const _Box({
    required this.width,
    required this.height,
    this.radius = 6,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}
