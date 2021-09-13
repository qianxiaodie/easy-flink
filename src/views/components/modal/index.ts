import Vue from 'vue';
import ModalMixin from './mixin';
import { MODAL_TYPE } from './constant';
import store from '@/store';

import MRenameModal from './rename.vue';
import MFolderModal from './folder.vue';
import MLinkModal from './link.vue';
import MJobModal from './job.vue';
import MMetadataModal from './metadata.vue';
import MResourceModal from './resource.vue';
import MTagModal from './tag.vue';
import MFileModal from './file.vue';
import MRecoverModal from './recover.vue';
import MStartModal from './start.vue';
import MAlarmModal from './alarm/alarm.vue';
import MProjectModal from './project.vue';
import MUserModal from './user.vue';
import MRecordModal from './record.vue';
import MTokenModal from './token.vue';
import MClusterModal from './cluster.vue';
import MKernelModal from './kernel.vue';
import MDockingModal from './docking.vue';
import MYarnModal from './yarn.vue';
import MStatusModal from './status.vue';
import MContainerModal from './container/container.vue';
import MSubmitterModal from './submit.vue';
import MJarModal from './jar.vue';
import MImageModal from './image.vue';
import MTopologyModal from './topology.vue';
import MFlinkModal from './flink.vue';
import MKafkaModal from './kafka.vue';
import MKDeployModal from './deployment.vue';
import MFolderModalV3 from './folder_v3.vue';
import MJobModalV3 from './job_v3.vue';

const getModalComp = (type: number): any => {
  switch (type) {
    case MODAL_TYPE.rename:
      return MRenameModal;
    case MODAL_TYPE.createFolder:
      return MFolderModal;
    case MODAL_TYPE.createJob:
      return MJobModal;
    case MODAL_TYPE.linkLabel:
      return MLinkModal;
    case MODAL_TYPE.createMetadata:
      return MMetadataModal;
    case MODAL_TYPE.linkResource:
      return MResourceModal;
    case MODAL_TYPE.createTag:
      return MTagModal;
    case MODAL_TYPE.uploadFile:
      return MFileModal;
    case MODAL_TYPE.start:
      return MStartModal;
    case MODAL_TYPE.recover:
      return MRecoverModal;
    case MODAL_TYPE.alarm:
      return MAlarmModal;
    case MODAL_TYPE.project:
      return MProjectModal;
    case MODAL_TYPE.user:
      return MUserModal;
    case MODAL_TYPE.record:
      return MRecordModal;
    case MODAL_TYPE.token:
      return MTokenModal;
    case MODAL_TYPE.cluster:
      return MClusterModal;
    case MODAL_TYPE.kernel:
      return MKernelModal;
    case MODAL_TYPE.docking:
      return MDockingModal;
    case MODAL_TYPE.yarn:
      return MYarnModal;
    case MODAL_TYPE.status:
      return MStatusModal;
    case MODAL_TYPE.container:
      return MContainerModal;
    case MODAL_TYPE.submitter:
      return MSubmitterModal;
    case MODAL_TYPE.jar:
      return MJarModal;
    case MODAL_TYPE.image:
      return MImageModal;
    case MODAL_TYPE.topology:
      return MTopologyModal;
    case MODAL_TYPE.flink:
      return MFlinkModal;
    case MODAL_TYPE.kafka:
      return MKafkaModal;
    case MODAL_TYPE.deployment:
      return MKDeployModal;
    case MODAL_TYPE.createFolder_v3:
      return MFolderModalV3;
    case MODAL_TYPE.createJob_v3:
      return MJobModalV3;
    default:
      return null;
  }
};

const createModalInstance = (type: number): ModalMixin | null => {
  const modalComp = getModalComp(type);
  if (!modalComp) {
    return null;
  }

  const ModalConstructor: any = Vue.extend(modalComp);
  const modalInstance = new ModalConstructor({
    store
  });
  modalInstance.vm = modalInstance.$mount();
  document.body.appendChild(modalInstance.vm.$el);

  return modalInstance.vm;
};

export default createModalInstance;
