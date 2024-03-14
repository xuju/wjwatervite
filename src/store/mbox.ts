import { action, computed, makeObservable, observable } from 'mobx';
import { createContext, useContext } from 'react';



class Store {
    @observable token = localStorage.getItem('token') ?? ''

    menu: Partial<MenuType> = observable.object({})
    constructor() {
        makeObservable(this);

    }
    @action setToken = (token: string) => {
        this.token = token
    }
    @action setMenu = (menu: MenuType) => {
        this.menu = menu
    }
    @computed
    get getMenu(): any[] {
        return this.menu.menu as any;
    }
}


export const store = new Store();
export const StoreContext = createContext<Store>({} as Store);
export const StoreProvider = StoreContext.Provider;
export const useStore = (): Store => useContext(StoreContext);