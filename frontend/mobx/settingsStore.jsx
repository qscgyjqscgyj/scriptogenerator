import {observable} from 'mobx';

export class SettingsStore {
    @observable advertisment = null;
}

export default new SettingsStore;