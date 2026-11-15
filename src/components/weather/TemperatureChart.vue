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
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { TemperatureChartPoint } from '../../types/weather';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

const props = defineProps<{
  points: TemperatureChartPoint[];
}>();

const canvas = ref<HTMLCanvasElement | null>(null);

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
            borderColor: '#2563eb',
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
    return;
  }

  chart.data.labels = labels();
  const dataset = chart.data.datasets[0];
  if (dataset) dataset.data = temperatures();
  chart.update();
}

watch(() => props.points, () => void syncChart(), { deep: true });

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
    <p v-if="points.length === 0" class="temperature-chart__empty">No temperature data</p>
    <canvas v-else ref="canvas" aria-label="Temperature"></canvas>
  </div>
</template>

<style scoped>
.temperature-chart {
  width: 100%;
  max-width: 28rem;
}

.temperature-chart__empty {
  margin: 0;
  font-size: 0.875rem;
}
</style>
