<template>
  <ag-grid-vue
    style="width: 80vw; height: 80vh"
    :columnDefs="colDefs"
    :defaultColDef="defaultColDef"
    :rowData="rowData"
    :getDataPath="getDataPath"
    :treeData="true"
    :groupDefaultExpanded="-1"
    :groupDisplayType="'custom'"
    :rowClassRules="rowClassRules">
  </ag-grid-vue>
</template>

<style>
.row-group-bold {
  font-weight: 600;
}
</style>

<script lang="ts">

import { ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";
import { AllEnterpriseModule, LicenseManager, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

// Register all Community and Enterprise features
ModuleRegistry.registerModules([AllEnterpriseModule, ClientSideRowModelModule, RowGroupingModule, RowGroupingPanelModule]);
LicenseManager.setLicenseKey("[TRIAL]_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-092283}_is_granted_for_evaluation_only___Use_in_production_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_purchasing_a_production_key_please_contact_info@ag-grid.com___You_are_granted_a_{Single_Application}_Developer_License_for_one_application_only___All_Front-End_JavaScript_developers_working_on_the_application_would_need_to_be_licensed___This_key_will_deactivate_on_{14 September 2025}____[v3]_[0102]_MTc1NzgwNDQwMDAwMA==9e87e5dbbd2e65bc37d2fcdc9f0929cc");

import { defineComponent, ref, computed, type PropType } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import type { ColDef, GetDataPath, ICellRendererParams } from "ag-grid-community";
import type { TreeItem, Id } from "../assets/ts/TreeStore";
import TreeStore from "../assets/ts/TreeStore";

type RowItem = TreeItem & { __path: string[] }

export default defineComponent({
  name: "TreeGrid",
  components: { AgGridVue, },
  props: {
    items: {
      type: Array as PropType<TreeItem[]>,
      required: true,
    }
  },
  setup(props) {
    const store = new TreeStore<TreeItem>(props.items)

    const rowData = computed<RowItem[]>(() => {
      return store.getAll().map((it) => {
        const chain = store.getAllParents(it.id) // [self, parent, ..., root]
        const path = [...chain].reverse().map(x => String((x as any).label ?? x.id))
        return { ...it, __path: path }
      })
    })

    const getDataPath: GetDataPath = (data: RowItem) => data.__path

    const colDefs = ref<ColDef[]>([
      { field: "id", headerName: "№ п/п", valueGetter: params => (params.node ? params.node.rowIndex + 1 : null), width: 100 },
      {
        headerName: "Категория",
        field: "parent",
        cellRenderer: "agGroupCellRenderer",
        showRowGroup: true,
        cellRendererParams: {
          suppressCount: true,
          innerRenderer: (params: ICellRendererParams) => {
            const id = params.data?.id as Id | undefined
            const isGroup = id !== undefined && store.getChildren(id).length > 0
            const el = document.createElement('span')
            el.textContent = isGroup ? 'Группа' : 'Элемент'
            if (isGroup) el.style.fontWeight = '600'
            return el
          }
        },
        width: 300,
      },
      { field: "label", headerName: "Наименование", flex: 1 },
    ])

    const defaultColDef = {
        width: 150,
        cellStyle: { 'text-align': 'left' },
    };

    const rowClassRules = {
      'row-group-bold': (params: any) => params.node?.hasChildren()
    }

    return {
      rowData,
      colDefs,
      defaultColDef,
      getDataPath,
      rowClassRules,
    }
  }
})
</script>