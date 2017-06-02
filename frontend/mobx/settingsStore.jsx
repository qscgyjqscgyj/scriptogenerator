import {observable} from 'mobx';

export class SettingsStore {
    @observable advertisment = null;
    @observable urls_map = null;
}

export default new SettingsStore;