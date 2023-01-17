<template>
  <v-row>
    <v-col class="text-center">
      <div>
        <form @submit="handleCreateListing">
          <div class="container">
            <!-- {/* Form Section */} -->
            <div class="createListingContainer">
              <h1 class="ourCollection">
                Create a new listing
              </h1>

              <!-- {/* Toggle between direct listing and auction listing */} -->
              <div class="listingTypeContainer">
                <input type="radio" name="listingType" id="directListing" value="directListing" defaultChecked
                  class="listingType" />
                <label htmlFor="directListing" class="listingTypeLabel">
                  Direct Listing
                </label>
                <!-- {/* <input type="radio" name="listingType" id="auctionListing" value="auctionListing"
                  class="listingType} />
                <label htmlFor="auctionListing" class="listingTypeLabel">
                  Auction Listing
                </label> */} -->
              </div>

              <div class="listingForm">
                <p class="sub">Product details</p>

                <input type="text" name="name" class="textInput" placeholder="Product Name" />

                <!-- {/* <input type="textarea" name="description" class="descriptionInput"
                  placeholder="Product Description" /> */} -->

                <textarea name="description" class="descriptionInput" placeholder="Product Description" />

                <input type="text" name="price" class="textInput" placeholder="Sale Price" />

                <label htmlFor="file-upload" class="uploadFile">
                  <input type="file" @change="handleFileChange" />
                  <p>Upload image <br />
                    <v-icon>mdi-upload</v-icon>
                  </p>
                </label>


                <p class="sub">Package details</p>

                <div class="packageContainer">
                  <input type="number" name="weight" class="textInput" placeholder="Weight(kg)" />

                  <input type="number" name="height" class="textInput" placeholder="Height(cm)" />
                </div>

                <div class="packageContainer">
                  <input type="number" name="width" class="textInput" placeholder="Width(cm)" />

                  <input type="number" name="depth" class="textInput" placeholder="Depth(cm)" />
                </div>
              </div>

              <!-- {/* <input id="file-upload" type="file" onChange={(e)=> setFile(
              // @ts-ignore: Object is possibly 'null'
              e?.target?.files[0])} /> */} -->

              <button type="submit" class="createButton" style="marginTop: 32, borderStyle: none">
                List Product
              </button>
            </div>
          </div>
        </form>
        <!-- {/* <Web3Button contractAddress={contractAddress} contractAbi={ABI_MARKETPLACE} // Call the name of your smart
          contract function action={(contract)=> contract.call("createListingRequest", name, description, {
          gasLimit: 3000000,
          })}
          >
          Call Contract Function
        </Web3Button> */} -->
      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  methods: {
    handleFileChange(e) {
      e.preventDefault();
      console.log('handleFileChange', e);
    },
    handleCreateListing(e) {
      e.preventDefault();
      console.log('handleCreateListing', e);
    },
  }
}
</script>