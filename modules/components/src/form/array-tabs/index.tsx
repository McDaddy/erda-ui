import React, { useState } from 'react';
import { Tabs, Badge } from 'antd';
import { ArrayField } from '@formily/core';
import { useField, observer, useFieldSchema, RecursionField } from '@formily/react';
import { TabsProps } from 'antd/lib/tabs';

export interface ErdaFormArrayTabsProps extends TabsProps {
  tabTitle?: (value: any | undefined) => React.ReactNode;
}

export const ArrayTabs: React.FC<ErdaFormArrayTabsProps> = observer((props) => {
  const field = useField<ArrayField>();
  const schema = useFieldSchema();
  const [activeKey, setActiveKey] = useState('tab-0');
  const value = Array.isArray(field.value) ? field.value : [];
  const dataSource = value?.length ? value : [{}];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { tabTitle, onChange, ...restProps } = props;

  const onEdit = (targetKey: any, type: 'add' | 'remove') => {
    if (type === 'add') {
      const id = dataSource.length;
      if (field?.value?.length) {
        field.push(null);
      } else {
        field.push(null, null);
      }
      setActiveKey(`tab-${id}`);
    } else if (type === 'remove') {
      const index = Number(targetKey.match(/-(\d+)/)?.[1]);
      if (index - 1 > -1) {
        setActiveKey(`tab-${index - 1}`);
      }
      field.remove(index);
    }
  };

  const badgedTab = (index: number) => {
    const tab = tabTitle ? tabTitle(value?.[index]) ?? '' : `${field.title || 'Untitled'} ${index + 1}`;
    const errors = field.errors.filter((error) => error.address?.includes(`${field.address}.${index}`));
    if (errors.length) {
      return (
        <Badge size="small" className="errors-badge" count={errors.length}>
          {tab}
        </Badge>
      );
    }
    return tab;
  };

  return (
    <Tabs
      type="editable-card"
      activeKey={activeKey}
      onChange={(key) => {
        setActiveKey(key);
      }}
      onEdit={onEdit}
      {...restProps}
    >
      {dataSource?.map((_item, index) => {
        const items = Array.isArray(schema.items) ? schema.items[index] : schema.items;
        const key = `tab-${index}`;
        return (
          <Tabs.TabPane key={key} forceRender closable={index !== 0} tab={badgedTab(index)}>
            <RecursionField schema={items!} name={index} />
          </Tabs.TabPane>
        );
      })}
    </Tabs>
  );
});

export default ArrayTabs;
