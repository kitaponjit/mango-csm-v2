<template>
  <a :href="href"><slot></slot></a>
</template>
<script>
  let cpn = {
    props: ['to'],
    data() {
      return {
        href: ''
      }
    },
    methods: {
      createLink() {

        if (this.$props.to) {
          let to = this.$props.to;
          let href = baseRoute + (to.path || '');
          if (to.query) {
            href += "?"
            let q = [];
            $linq(Object.keys(to.query)).foreach(x => {
              q.push(encodeURIComponent(x) + '=' + encodeURIComponent(to.query[x]));
            });
            href += q.join('&');
          }

          this.$set(this, 'href', href);
        }
      }
    },
    mounted() {
      this.createLink();
    },
    watch: {
      to(n, o) {
        this.createLink();
      }
    }
  };
  export default cpn;
</script>
