const routeText = {
  ask: '问答',
  test: '测验',
  analysis: '分析'
};

const tones = ['#1769e0', '#14a677', '#e09d17', '#d6465f', '#7755d9'];

export function createMockCards(routeKey, count = 80) {
  const label = routeText[routeKey] || '业务';

  return Array.from({ length: count }, (_, index) => {
    const value = ((index * 37 + routeKey.length * 19) % 100) + 1;
    const score = ((index * 11 + routeKey.length * 23) % 96) + 4;

    return {
      id: `${routeKey}-card-${index + 1}`,
      title: `${label}数据 ${String(index + 1).padStart(3, '0')}`,
      subtitle: `Mock payload / ${routeKey} / batch ${Math.floor(index / 12) + 1}`,
      value,
      score,
      tone: tones[index % tones.length],
      status: value > 70 ? '高' : value > 35 ? '中' : '低'
    };
  });
}

export function createMockTimeline(routeKey, count = 120) {
  const label = routeText[routeKey] || '业务';

  return Array.from({ length: count }, (_, index) => ({
    id: `${routeKey}-timeline-${index + 1}`,
    title: `${label}事件流 ${index + 1}`,
    detail: `渲染批次 ${Math.floor(index / 10) + 1}，节点 ${index % 10}，用于观察路由切换压力。`,
    time: `${String(8 + (index % 12)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}`,
    progress: ((index * 13 + 27) % 100) + 1
  }));
}

export function createMockStats(routeKey) {
  return createMockCards(routeKey, 12).map((item, index) => ({
    ...item,
    title: `指标 ${index + 1}`,
    value: item.value * (index + 3)
  }));
}
