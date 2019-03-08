const list = window.location.search
  .substr(1)
  .split('&')
  .map(x => x.split('='));

const params = new Map(list as any);

export default function getParam<T>(name: string, def: T): T {
  return params.has(name) ? (params.get(name) as T) : def;
}
