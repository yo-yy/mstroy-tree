export type Id = string | number

export interface TreeItem {
  id: Id
  parent: Id | null
  label: string
}

export default class TreeStore<T extends TreeItem> {
  private items: T[];
  private byId: Map<Id, T>;
  private childrenByParent: Map<Id | null, Id[]>;
  private parentById: Map<Id, Id | null>;

  constructor(items: T[]) {
    this.items = [...items];
    this.byId = new Map();
    this.childrenByParent = new Map();
    this.parentById = new Map();

    for (const it of this.items) {
      this.byId.set(it.id, it);
      this.parentById.set(it.id, it.parent ?? null);

      const p = it.parent ?? null;
      const arr = this.childrenByParent.get(p);
      if (arr) arr.push(it.id);
      else this.childrenByParent.set(p, [it.id]);
    }
  }

  getAll(): T[] {
    return this.items;
  }

  getChildren(id: Id): T[] {
    const ids = this.childrenByParent.get(id) ?? [];
    return ids.map((cid) => this.byId.get(cid)!).filter(Boolean);
  } 

  getAllChildren(id: Id): T[] {
    const result: T[] = [];
    const stack: Id[] = [...(this.childrenByParent.get(id) ?? [])];

    while (stack.length) {
      const curId = stack.pop()!;
      const node = this.byId.get(curId);
      if (!node) continue;
      result.push(node);

      const children = this.childrenByParent.get(curId);
      if (children && children.length) {
        // DFS: добавляем в стек
        for (let i = 0; i < children.length; i++) {
          stack.push(children[i]);
        }
      }
    }
    return result;
  }

  getAllParents(id: Id): T[] {
    const path: T[] = [];
    let curId: Id | null | undefined = id;

    while (curId !== null && curId !== undefined) {
      const node = this.byId.get(curId);
      if (!node) break;
      path.push(node);
      curId = this.parentById.get(curId) ?? null;
    }

    return path;
  }

  addItem(item: T): T {
    const id = item.id;
    if (this.byId.has(id)) {
      throw new Error(`addItem: element with id "${id}" already exists`);
    }

    this.items.push(item);

    this.byId.set(id, item);
    const parent = item.parent ?? null;
    this.parentById.set(id, parent);

    const siblings = this.childrenByParent.get(parent);
    if (siblings) siblings.push(id);
    else this.childrenByParent.set(parent, [id]);

    return item;
  }

  updateItem(update: Partial<T> & Pick<T, "id">): T {
    const existing = this.byId.get(update.id);
    if (!existing) {
      throw new Error(`updateItem: element with id "${String(update.id)}" not found`);
    }

    const oldParent = existing.parent ?? null;
    const updated = { ...(existing as object), ...(update as object) } as T;
    const newParent = (updated.parent ?? null) as Id | null;

    const idx = this.items.findIndex((x) => x.id === updated.id);
    if (idx !== -1) this.items[idx] = updated;

    this.byId.set(updated.id, updated);
    this.parentById.set(updated.id, newParent);

    if (oldParent !== newParent) {
      const oldArr = this.childrenByParent.get(oldParent);
      if (oldArr) {
        const pos = oldArr.indexOf(updated.id);
        if (pos !== -1) oldArr.splice(pos, 1);
      }
      const newArr = this.childrenByParent.get(newParent);
      if (newArr) newArr.push(updated.id);
      else this.childrenByParent.set(newParent, [updated.id]);
    }

    return updated;
  }

  removeItem(id: Id): Id[] {
    if (!this.byId.has(id)) return [];

    const toDelete: Id[] = [id];
    const stack: Id[] = [...(this.childrenByParent.get(id) ?? [])];

    while (stack.length) {
      const curId = stack.pop()!;
      toDelete.push(curId);
      const ch = this.childrenByParent.get(curId);
      if (ch && ch.length) {
        for (let i = 0; i < ch.length; i++) stack.push(ch[i]);
      }
    }

    const delSet = new Set(toDelete);
    this.items = this.items.filter((it) => !delSet.has(it.id));

    for (const delId of toDelete) {
      const parent = this.parentById.get(delId) ?? null;
      const siblings = this.childrenByParent.get(parent);
      if (siblings) {
        const pos = siblings.indexOf(delId);
        if (pos !== -1) siblings.splice(pos, 1);
      }

      this.byId.delete(delId);
      this.parentById.delete(delId);

      this.childrenByParent.delete(delId);
    }

    return toDelete;
  }
}