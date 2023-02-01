import requests
from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel
from pydash import objects, collections
from vyper import v
from web3 import Web3
from datetime import datetime
from deta import Deta

import json
import logging
import os

logging.basicConfig(level="INFO")

app = FastAPI()
x_rate_usdcop = None
PENGUIN_X_MARKETPLACE_ADDRESS = "0x41727cd6d5aA199199DEdD63E34D6A9B846c3339"
PENGUIN_X_NFT_ADDRESS = "0x10b467e33a30144223A8A29A473c2032A3519b67"
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
with open('abis.json') as abis:
    abis = json.load(abis)
    ABI_MARKETPLACE = abis['ABI_MARKETPLACE']
    ABI_NFT = abis['ABI_NFT']
    print("abis loaded")


## DYNAMIC GLOBALS (DEPENDING ON ENVIRONMENT)
DEV_MODE = False
try:
    # Try to get local configuration
    v.set_config_name('config')  # name of config file (without extension)
    v.set_config_name('.env')  # name of config file (without extension)
    v.add_config_path('.')  # optionally look for config in the working directory
    v.read_in_config()  # Find and read the config file
    v.set_env_prefix('PENGUINX_')  # will be uppercased automatically
    v.bind_env('dev_mode')
    v.bind_env('dev_host')

    if v.get_bool('DEV_MODE'):
        DEV_MODE = True
except Exception as e:
    print(f"failed reading config file, asume cloud @db: {e}")

if DEV_MODE:
    # Perform all DEV_MODE configuration here
    
    # Get configuration values

    ## Hooks
    v.bind_env('hook_services')
    HOOK_SERVICES = HOOK_SECURITY = v.get_string('hook_services')
    HOOKA = v.get_string("HOOKA")
    ALCHEMY_PROVIDER = v.get_string("ALCHEMY")
    DETA_PROJECT_KEY = v.get_string("DETA_PROJECT_KEY")

else:
    HOOKA = os.environ['HOOKA']
    ALCHEMY_PROVIDER = os.environ['ALCHEMY']
    DETA_PROJECT_KEY = os.environ['DETA_PROJECT_KEY']


deta = Deta(DETA_PROJECT_KEY)
penguinx_db = deta.Base("penguinx")
X_RATE_USDCOP_LAST = "X_RATE_USDCOP_LAST"
X_RATE_USDCOP_LAST_OBTAINED = "X_RATE_USDCOP_LAST_OBTAINED"
LAST_NOTIFIED_LISTING = "LAST_NOTIFIED_LISTING"
LAST_NOTIFIED_LISTING_BLOCK_CHECKED = "LAST_NOTIFIED_LISTING_BLOCK_CHECKED"
LAST_NOTIFIED_SALE_BLOCK_CHECKED = "LAST_NOTIFIED_SALE_BLOCK_CHECKED"
LAST_NOTIFIED_SALE = "LAST_NOTIFIED_SALE"

def get_stored_val(key):
  resp = penguinx_db.get(key)
  if resp:
    return resp['value']
  return None

def set_stored_val(id, val):
    resp = penguinx_db.put(val, key=id)
    print(f"set_stored_val {id} {val} resp: {resp}")


# logging.info("setting test value")
# test_key = "answer_to_life"
# resp = penguinx_db.put(42, key=test_key)
# logging.info(f"response: {resp}")
# logging.info(f"testing get: {penguinx_db.get(test_key)['value']}")


class StuffProperties(BaseModel):
    origin: str
    weight: float
    height: float
    width: float
    depth: float
    price: float

class Listing(BaseModel):
    address: str

@app.get("/")
def read_root():
    resp = {"Hello": get_x_rate_usdcop()}
    return resp

@app.post("/delivery/calculation/")
def delivery_calculation(stuff: StuffProperties):
    headers = {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/json;chartset=utf-8',
        'Origin': 'https://www.deprisa.com',
        # 'Content-Length': '378',
        'Accept-Language': 'en-US,en;q=0.9',
        'Host': 'services.deprisa.com',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
        'Referer': 'https://www.deprisa.com/',
        # 'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
    }

    json_data = {
        'Admision': {
            'Tipo_Envio': 'I',
            'Numero_Bultos': 1,
            'Kilos': '0.3',
            'Cliente_Remitente': '99999999',
            'Centro_remitente': '99',
            'Pais_Origen': '057',
            'Ciudad_Origen': 'YUMBO',
            'Pais_Destino': '840',
            'Ciudad_Destino': '',
            'Incoterm': '',
            'Codigo_Servicio': '',
            'Largo': '10',
            'Ancho': '10',
            'Alto': '10',
            'Tipo_Mercancia': '',
            'Contenedor_Mercancia': 'C',
            'Importe_Valor_Declarado': '420000',
            'Tipo_Moneda': 'COP',
        },
    }

    json_data = {
        'Admision': {
            'Tipo_Envio': 'I',
            'Numero_Bultos': 1,
            'Kilos': str(stuff.weight),
            'Cliente_Remitente': '99999999',
            'Centro_remitente': '99',
            'Pais_Origen': '057',
            'Ciudad_Origen': stuff.origin,
            'Pais_Destino': '840',
            'Ciudad_Destino': '',
            'Incoterm': '',
            'Codigo_Servicio': '',
            'Largo': str(int(stuff.depth)),
            'Ancho': str(int(stuff.width)),
            'Alto': str(int(stuff.height)),
            'Tipo_Mercancia': '',
            'Contenedor_Mercancia': 'C',
            'Importe_Valor_Declarado': '420000',
            'Tipo_Moneda': 'COP',
        },
    }

    print(f"delivery_calculation for {stuff} json_data: {json_data}")

    response = requests.post('https://services.deprisa.com/api/Cotizaciones/Cotizar', headers=headers, json=json_data)

    # Note: json_data will not be serialized by requests
    # exactly as it was in the original request.
    #data = '{"Admision":{"Tipo_Envio":"I","Numero_Bultos":1,"Kilos":"0.3","Cliente_Remitente":"99999999","Centro_remitente":"99","Pais_Origen":"057","Ciudad_Origen":"YUMBO","Pais_Destino":"840","Ciudad_Destino":"","Incoterm":"","Codigo_Servicio":"","Largo":"10","Ancho":"10","Alto":"10","Tipo_Mercancia":"","Contenedor_Mercancia":"C","Importe_Valor_Declarado":"420000","Tipo_Moneda":"COP"}}'
    #response = requests.post('https://services.deprisa.com/api/Cotizaciones/Cotizar', headers=headers, data=data)
    print("alo")
    print(response)
    print(response.text)
    response = response.json()

    cop_total = objects.get(response, 'Respuesta.Productos[0].Total')
    usdcop = get_x_rate_usdcop()
    usd_total = cop_total / usdcop

    print(f"cop_total: {cop_total} usdcop: {usdcop}")

    return {'usd': usd_total}

@app.post("/listing/new/")
def listing_new(listing: Listing):

    print(f"listing_new {listing}")

    sdk = ThirdwebSDK("polygon")
    # sdk = ThirdwebSDK("goerli")

    # Add your NFT Collection contract address here
    NFT_COLLECTION_ADDRESS = listing.address

    # And you can instantiate your contract with just one line
    nft_collection = sdk.get_nft_collection(NFT_COLLECTION_ADDRESS)

    # Now you can use any of the read-only SDK contract functions
    nfts = nft_collection.get_all()
    print(nfts)

def get_x_rate_usdcop():
    x_rate_usdcop_last = get_stored_val(X_RATE_USDCOP_LAST)
    x_rate_usdcop_last_obtained = get_stored_val(X_RATE_USDCOP_LAST_OBTAINED)
    now = datetime.utcnow().timestamp()
    print(f"get_x_rate_usdcop @ {now}. x_rate_usdcop_last_obtained: {x_rate_usdcop_last_obtained}")
    if x_rate_usdcop_last_obtained and now - x_rate_usdcop_last_obtained < 120:
        return x_rate_usdcop_last
    x_rate_usdcop_last = float(requests.get('https://localbitcoins.com/api/equation/USD_in_COP*1', timeout=5).json().get('data'))
    set_stored_val(X_RATE_USDCOP_LAST_OBTAINED, now)
    set_stored_val(X_RATE_USDCOP_LAST, x_rate_usdcop_last)
    return x_rate_usdcop_last

@app.get("/listings/check/")
def check_listings():
    # sdk = ThirdwebSDK("goerli")
    # custom = sdk.get_contract(PENGUIN_X_MARKETPLACE_ADDRESS)º
    # print(f"contract: {custom}")
    print(f"w3 loading")
    w3 = Web3(Web3.HTTPProvider(ALCHEMY_PROVIDER))
    print(f"w3 loaded")
    
    marketplace = w3.eth.contract(address=PENGUIN_X_MARKETPLACE_ADDRESS, abi=ABI_MARKETPLACE)
    # import pdb; pdb.set_trace()
    # events = [ev for ev in marketplace.events]
    # new_listing_requests = collections.filter_(events, lambda x: x.event_name == 'NewListingRequest')


    # Check new listing requests
    last_notified_listing_block_checked = get_stored_val(LAST_NOTIFIED_LISTING_BLOCK_CHECKED) or 7771420
    last_notified_listing = get_stored_val(LAST_NOTIFIED_LISTING)
    resp = marketplace.events.NewListingRequest.createFilter(fromBlock=last_notified_listing_block_checked, topics=[])


    print(f"last_notified_listing_block_checked: {last_notified_listing_block_checked}")
    # last_notified_listing_block_checked = w3.eth.block_number

    x = 0
    for ev in resp.get_all_entries():
        print(f"event {x}: {ev}")
        print(f"ev.args {ev.args}")
        penguin_x_nft = w3.eth.contract(address=PENGUIN_X_NFT_ADDRESS, abi=ABI_NFT)
        print(f"event {x} penguin_x_nft: {repr(penguin_x_nft)} {dir(penguin_x_nft)}")
        # import pdb; pdb.set_trace()
        try:
            listing_id = ev.args['listingId']
            print(f"listing_id: {listing_id}")
            verifier = penguin_x_nft.functions.verifier(listing_id).call()
            print(f"verifier {listing_id}: {verifier}")
        except Exception as e:
            print(f"error: {repr(e)}")
            raise e
        if verifier == ZERO_ADDRESS:
            print(f"verifier is ZERO_ADDRESS, last_notified_listing is {last_notified_listing}")
            try:
                if last_notified_listing != listing_id:
                    listing_request = marketplace.functions.listing_requests(listing_id).call()
                    msg = f'listing request #{listing_id}: {listing_request}'
                    print(msg)
                    print(listing_request[3])
                    nft = PenguinXNft(penguin_x_nft.address, listing_id)
                    nft.set_contract(penguin_x_nft)
                    aprox = nft.get_delivery_aprox(marketplace, uri=listing_request[3]) # base_uri
                    msg += f". Delivery aprox: {aprox}"
                    print(msg)
                    image = False
                    try:
                        metadata = nft.get_metadata()
                        if 'image' in metadata:
                            image = metadata['image'].split('ipfs://')[1]
                            if image:
                                image = f'https://gateway.ipfscdn.io/ipfs/{image}'
                    except Exception as e:
                        print(f"failed getting image {repr(e)}")

                    sendHook(msg, image=image, title="🐧 New Listing Request")
                    last_notified_listing = listing_id
                    set_stored_val(LAST_NOTIFIED_LISTING, last_notified_listing)
                    set_stored_val(LAST_NOTIFIED_LISTING_BLOCK_CHECKED, ev.blockNumber)
            except Exception as e:
                print(f"ERROR: failed reporting {repr(e)}")
        x += 1

    # Check new sales
    last_notified_sale_block_checked = get_stored_val(LAST_NOTIFIED_SALE_BLOCK_CHECKED) or 7771420
    last_notified_sale = get_stored_val(LAST_NOTIFIED_SALE)
    resp = marketplace.events.NewSale.createFilter(fromBlock=last_notified_sale_block_checked, topics=[])


    print(f"last_notified_sale_block_checked: {last_notified_sale_block_checked}")
    # last_notified_listing_block_checked = w3.eth.block_number

    x = 0
    for ev in resp.get_all_entries():
        print(f"event {x}: {ev}")
        print(f"ev.args {ev.args}")
        penguin_x_nft = w3.eth.contract(address=PENGUIN_X_NFT_ADDRESS, abi=ABI_NFT)
        print(f"event {x} penguin_x_nft: {repr(penguin_x_nft)} {dir(penguin_x_nft)}")
        # import pdb; pdb.set_trace()
        try:
            listing_id = ev.args['listingId']
            print(f"sale listing_id: {listing_id}")
            verifier = penguin_x_nft.functions.verifier(listing_id).call()
            print(f"verifier {listing_id}: {verifier}")
        except Exception as e:
            print(f"error: {repr(e)}")
            raise e
        # if verifier == ZERO_ADDRESS:
            # print(f"verifier is ZERO_ADDRESS, last_notified_listing is {last_notified_listing}")
            # try:
            #     if last_notified_listing != listing_id:
            #         listing_request = marketplace.functions.listing_requests(listing_id).call()
            #         msg = f'🐧 Unverified listing #{listing_id}: {listing_request}'
            #         print(msg)
            #         print(listing_request[3])
            #         nft = PenguinXNft(penguin_x_nft.address, listing_id)
            #         nft.set_contract(penguin_x_nft)
            #         aprox = nft.get_delivery_aprox(marketplace, uri=listing_request[3]) # base_uri
            #         msg += f". Delivery aprox: {aprox}"
            #         print(msg)
            #         sendHook(msg)
            #         last_notified_listing = listing_id
            #         set_stored_val(LAST_NOTIFIED_LISTING, last_notified_listing)
            #         set_stored_val(LAST_NOTIFIED_LISTING_BLOCK_CHECKED, ev.blockNumber)
            # except Exception as e:
            #     print(f"ERROR: failed reporting {repr(e)}")
        x += 1


    return f"ok {PENGUIN_X_MARKETPLACE_ADDRESS}"

class PenguinXNft():
    def __init__(self, address, token_id):
        self.address = address
        self.token_id = token_id
        self.metadata = False

    def get_contract(self):
        w3 = Web3(Web3.HTTPProvider(ALCHEMY_PROVIDER))
        self.contract = w3.eth.contract(address=self.address, abi=ABI_NFT)
        print(f"contract loaded {self.contract}")
        return self.contract
    
    def set_contract(self, contract):
        print(f"set_contract {self.token_id} {contract}")
        self.contract = contract

    def get_metadata(self, marketplace, uri=False):
        print(f"get_metadata {self.token_id}")
        if (self.metadata):
            return self.metadata
        # uri: str = self.contract.functions.tokenURI(self.token_id).call()

        url = f"https://cloudflare-ipfs.com/ipfs/{uri.split('ipfs://')[1]}"
        print(f"getting metadata for {self.address} @ {url}")
        self.metadata = requests.get(url, timeout=5).json()
        return self.metadata

    def get_delivery_aprox(self, marketplace, uri=False):
        metadata = self.get_metadata(marketplace, uri=uri)
        print(f"getting delivery_aprox for {self.address}. metadata: {metadata}")
        depth = width = height = weight = None
        for pr in metadata['properties']:
            if pr['name'] == 'Weight(kg)':
                weight = pr['value']
            if pr['name'] == 'Height(cm)':
                height = pr['value']
            if pr['name'] == 'Width(cm)':
                width = pr['value']
            if pr['name'] == 'Depth(cm)':
                depth = pr['value']
        
        return delivery_calculation(StuffProperties(
            origin="YUMBO",  # testing, is a town in colombia
            depth=depth,
            width=width,
            height=height,
            weight=weight,
            price=42
        ))


## Helpers
def sendHook(message, title=False, detail=False, durl=False, color=320252, image=False, url=HOOKA):
    try:
        robj = dict(
                username="Penguin X",
                avatar_url="https://penguinx.xyz/favicon.ico",
                content=message,
            )
        if title or detail:
            robj['embeds'] = [{
                "color": color,
            }]
            if durl:
                robj['embeds'][0]['url'] = durl
            if title:
                robj['embeds'][0]['title'] = title
            if detail:
                robj['embeds'][0]['description'] = detail
            if image:
                robj['embeds'][0]['image'] = {'url': image}   
            robj['embeds'][0]['footer'] = {'text': 'Keep rocking'}

        print(f'sendingHook: {robj}')
        resp = requests.post(
            url,
            headers={
                'Content-type': 'application/json'
            },
            json=robj,
            timeout=5
        )
        
    except Exception as e:
        logging.error(f"error @sendHook: {repr(e)}")

# sendHook(f"🐧 PenguinX c-end started")