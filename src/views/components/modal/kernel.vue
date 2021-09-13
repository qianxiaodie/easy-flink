<template>
  <ndc-modal class="m-kernel-modal" :title="modalData.isEdit ? '编辑内核' : '添加内核'" :visible="visible" @hide="onHide" :on-confirm="onConfirm">
    <ndc-form :label-size="'3'">
      <ndc-form-item label="内核名称" required>
        <u-validator name="kernelName" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="kernelName"
            autocomplete="off"
            v-maxlength="64"
            v-model="modalData.kernelName"
            placeholder="请输入内核名称"
            v-validate="{
              required: '内核名称'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="内核类型" required>
        <u-validator name="kernelType" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="kernelType"
            autocomplete="off"
            v-model="modalData.kernelType"
            placeholder="请输入内核类型"
            v-validate="{
              required: '内核类型'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="内核lib包目录" required>
        <u-validator name="jarPath" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="jarPath"
            autocomplete="off"
            v-model="modalData.jarPath"
            placeholder="请输入内核lib包目录"
            v-validate="{
              required: '内核lib包目录'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="内核实现类" required>
        <u-validator name="implName" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="implName"
            autocomplete="off"
            v-model="modalData.implName"
            placeholder="请输入内核实现类"
            v-validate="{
              required: '内核实现类'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="是否使用shell" required>
        <u-validator name="shell" :validate="errors">
          <ndc-select
            name="shell"
            placeholder="请选择是否使用shell"
            value-key="key"
            label-key="label"
            :options="shellOptions"
            v-model="modalData.shell"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="shell脚本路径" required v-if="modalData.shell">
        <u-validator name="shellPath" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="shellPath"
            autocomplete="off"
            v-model="modalData.shellPath"
            placeholder="请输入shell脚本路径"
            v-validate="{
              required: 'shell脚本路径'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="flink包目录" required>
        <u-validator name="flinkPath" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="flinkPath"
            autocomplete="off"
            v-model="modalData.flinkPath"
            placeholder="请输入flink包目录"
            v-validate="{
              required: 'flink包目录'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="启动参数" required>
        <u-validator name="launchParameters" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="launchParameters"
            autocomplete="off"
            v-model="modalData.launchParameters"
            placeholder="请输入启动参数"
            v-validate="{
              required: '启动参数'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="扩展参数" required>
        <u-validator name="extendParameters" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="extendParameters"
            autocomplete="off"
            v-model="modalData.extendParameters"
            placeholder="请输入扩展参数"
            v-validate="{
              required: '扩展参数'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="支持的任务类型" required>
        <u-validator name="taskType" :validate="errors">
          <ndc-select
            name="taskType"
            placeholder="请选择支持的任务类型"
            value-key="key"
            label-key="label"
            :options="typeOptions"
            v-model="modalData.taskType"
            v-validate="{
              required: '支持的任务类型'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';

@Component
export default class MKernelModal extends Mixins(ModalMixin) {
  private shellOptions: any[] = [{
    key: true,
    label: '是'
  }, {
    key: false,
    label: '否'
  }];
  private typeOptions: any[] = [{
    key: 'ALL',
    label: 'ALL'
  }, {
    key: 'SQL',
    label: 'SQL'
  }, {
    key: 'JAR',
    label: 'JAR'
  }];
}
</script>
