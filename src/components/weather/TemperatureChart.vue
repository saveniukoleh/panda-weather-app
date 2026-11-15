<script setup lang="ts">
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { storeToRefs } from 'pinia';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useSettingsStore } from '../../stores/settingsStore';
import type { TemperatureChartPoint } from '../../types/weather';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

const props = defineProps<{
  points: TemperatureChartPoint[];
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const { theme } = storeToRefs(useSettingsStore());

function chartToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function chartTextColor(): string {
  return chartToken('--color-text', '#1b2430');
}

let chart: Chart<'line', number[], string> | null = null;
let syncId = 0;

function temperatures(): number[] {
  return props.points.map((point) => point.temperatureC);
}

function labels(): string[] {
  return props.points.map((point) => point.label);
}

function destroyChart(): void {
  chart?.destroy();
  chart = null;
}

async function syncChart(): Promise<void> {
  const current = ++syncId;

  if (props.points.length === 0) {
    destroyChart();
    return;
  }

  await nextTick();
  if (current !== syncId || props.points.length === 0 || canvas.value === null) return;

  if (chart === null) {
    chart = new Chart(canvas.value, {
      type: 'line',
      data: {
        labels: labels(),
        datasets: [
          {
            data: temperatures(),
            borderColor: chartToken('--color-accent', '#1a6bb5'),
          },
        ],
      },
      options: {
        responsive: true,
        color: chartTextColor(),
        scales: {
          x: {
            ticks: { color: chartTextColor() },
            grid: { color: chartToken('--color-separator', '#e3e9f0') },
          },
          y: {
            ticks: { color: chartTextColor() },
            grid: { color: chartToken('--color-separator', '#e3e9f0') },
          },
        },
      },
    });
    return;
  }

  chart.data.labels = labels();
  const dataset = chart.data.datasets[0];
  if (dataset) {
    dataset.data = temperatures();
    dataset.borderColor = chartToken('--color-accent', '#1a6bb5');
  }
  const text = chartTextColor();
  const grid = chartToken('--color-separator', '#e3e9f0');
  chart.options.color = text;
  for (const axis of [chart.options.scales?.x, chart.options.scales?.y]) {
    if (!axis) continue;
    if (axis.ticks) axis.ticks.color = text;
    if ('grid' in axis && axis.grid) axis.grid.color = grid;
  }
  chart.update();
}

watch(
  () => props.points,
  () => void syncChart(),
  { deep: true },
);

watch(theme, () => void syncChart());

onMounted(() => {
  void syncChart();
});

onBeforeUnmount(() => {
  syncId += 1;
  destroyChart();
});
</script>

<template>
  <div class="temperature-chart">
    <p v-if="points.length === 0" class="temperature-chart__empty">{{ $t('chart.empty') }}</p>
    <template v-else>
      <p class="temperature-chart__unit">{{ $t('chart.label') }} (°C)</p>
      <canvas ref="canvas" :aria-label="$t('chart.label')"></canvas>
    </template>
  </div>
</template>

<style scoped>
.temperature-chart {
  width: 100%;
  max-width: 28rem;
}

.temperature-chart__unit,
.temperature-chart__empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.temperature-chart__unit {
  margin-bottom: var(--space-1);
}
</style>
