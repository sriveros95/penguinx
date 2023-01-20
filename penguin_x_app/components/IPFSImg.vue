<template>
    <v-img v-if="mysrc" :src="mysrc" contain height="333"></v-img>
</template>


<script>
export default {
    props: {
        metadata_src: { type: undefined | String, default: undefined }
    },
    data: () => ({
        metadata: undefined,
        mysrc: undefined,
    }),
    async mounted() {
        if (this.metadata_src) {
            try {
                this.metadata = await this.$loadMetadata(this.metadata_src)
            } catch (error) {
                console.error('failed getting metadata', error);
            }
            console.log('metadata loaded', this.metadata);
            if (this.metadata.image) {
                let image_url = this.metadata.image.split('ipfs://')[1]
                if (image_url) { this.mysrc = `https://gateway.ipfscdn.io/ipfs/${image_url}` }
            }
        }
    }
}
</script>