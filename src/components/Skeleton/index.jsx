import { defineComponent, ref, watch } from "vue";
// 导入skeleton
import { ElSkeleton } from "element-plus";
const props = {
  animated: {
    type: Boolean,
    default: true
  },
  count: {
    type: Number,
    default: 1
  },
  loading: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 3
  },
  throttle: {
    type: Number,
    default: 0
  },
  gridCols: {
    type: Number,
    default: 3
  },
  gridRowGap: {
    type: String,
    default: "20px"
  },
  gridColGap: {
    type: String,
    default: "20px"
  },

};

export default defineComponent({
  name: "Skeleton",
  props,
  emits: ["refresh"],
  setup(props, { slots }) {
    watch(
      () => props.gridCols,
      val => {
        skeletonListStyle.value.gridTemplateColumns = `repeat(${val}, 1fr)`;
      }
    );
    const skeletonListStyle = ref({
      display: "grid",
      boxSizing: "border-box",
      gridTemplateColumns: `repeat(${props.gridCols}, 1fr)`,
      gridRowGap: props.gridRowGap,
      gridColumnGap: props.gridColGap,
      position: "relative"
    });

    return () => {
      const arr = [];
      for (let i = 0; i < props.count; i++) {
        arr.push(
          <ElSkeleton
            animated={props.animated}
            loading={props.loading}
            rows={props.rows}
            throttle={props.throttle}
            key={i}
          >
            {{
              template: () => slots.template?.()
            }}
          </ElSkeleton>
        );
      }
      return (
        <>
          <div class="skeleton-list" style={skeletonListStyle.value}>
            {props.loading ? arr : slots.default?.()}
          </div>
        </>
      );
    };
  }
});
