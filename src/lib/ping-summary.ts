import type { PingRecord, PingTask } from "@/lib/schemas";

export function summarizePing(records: PingRecord[], tasks: PingTask[]) {
  const samples = records.filter(
    (record) =>
      Number.isFinite(record.value) && Number.isFinite(Date.parse(record.time)),
  );
  const aggregate = (items: PingRecord[]) => {
    const valid = items.filter((item) => item.value >= 0);
    return {
      latency: valid.length
        ? valid.reduce((sum, item) => sum + item.value, 0) / valid.length
        : null,
      loss: items.length
        ? ((items.length - valid.length) / items.length) * 100
        : null,
    };
  };
  const latest = samples.reduce(
    (time, item) => Math.max(time, Date.parse(item.time)),
    0,
  );
  // Ten equal six-minute buckets, ending at the latest reported sample.
  const start = latest - 3_600_000;
  const recent = samples.filter((item) => Date.parse(item.time) > start);
  const buckets: PingRecord[][] = Array.from({ length: 10 }, () => []);
  const byTask = new Map<string, PingRecord[]>();
  for (const item of recent) {
    const index = Math.min(
      9,
      Math.floor((Date.parse(item.time) - start) / 360_000),
    );
    buckets[index]?.push(item);
    if (item.task_id === undefined) continue;
    const id = String(item.task_id);
    const group = byTask.get(id) ?? [];
    group.push(item);
    byTask.set(id, group);
  }
  const order = new Map(tasks.map((task, index) => [String(task.id), index]));
  const networks = [...byTask]
    .map(([id, items]) => ({
      id,
      name: tasks.find((task) => String(task.id) === id)?.name || `Ping ${id}`,
      ...aggregate(items),
    }))
    .sort(
      (a, b) =>
        (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity) ||
        a.id.localeCompare(b.id),
    );
  return {
    ...aggregate(recent),
    networks,
    history: buckets.map((items, index) => ({
      time: start + (index + 1) * 360_000,
      ...aggregate(items),
    })),
  };
}
