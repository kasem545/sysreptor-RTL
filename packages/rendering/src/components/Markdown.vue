<script lang="ts">
import { defineComponent, h } from 'vue';
import { renderMarkdownToHtml } from '@sysreptor/markdown';

export default {
  name: 'markdown',
  props: {
    text: {
      type: String,
      default: null,
    },
  },
  methods: {
    compileMarkdown(text: string) {
      // The document element dir attribute is set by the rendering pipeline based on the report language
      const baseDirection = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
      return renderMarkdownToHtml({ text, preview: false, baseDirection });
    },
  },
  render() {
    let mdText = this.text;
    if (!mdText && this.$slots.default) {
      // Slot content is always raw text because of templateCompilerOptions.getTextMode
      mdText = this.$slots.default().map(vnode => vnode.children).join('');
    }
    return h('div', { class: 'markdown' }, [
      h(defineComponent({
        name: 'markdown-content',
        data: () => this.$root!,
        components: this.$root?.$options.components,
        ...(mdText ? 
          { template: this.compileMarkdown(mdText) } : 
          { render: () => [] }
        ),
      })),
    ]);
  }
}
</script>

<style lang="scss">
@use "sass:meta";

@layer highlight {
  @include meta.load-css("highlight.js/styles/github.css");
}

.code-block {
  white-space: pre-wrap;
}
.code-block code {
  display: block;
}

.markdown-inline, .markdown-inline > *:first-child {
  display: inline;
  margin-top: 0;
}
</style>
