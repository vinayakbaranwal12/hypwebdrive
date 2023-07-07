import {MenuItemConfig} from '../../../../core/settings/settings';

export interface MenuItemCategory {
  name: string;
  type: string;
  items: MenuItemCategoryItem[];
}

interface MenuItemCategoryItem extends Partial<MenuItemConfig> {
  label: string;
  model_id?: number;
}
