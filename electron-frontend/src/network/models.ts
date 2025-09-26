
export interface Item {
    id?: number;
    category: number | string;
    name: string;
}

export interface ChildItem {
    parentItem?: string | number;
    id?: number;
    name: string;
    price: number;
}


export interface ListItems<T>{
    items: T[];

}