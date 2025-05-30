try:
    from packet import IPv4Packet
except ImportError:
    raise ImportError("Trieda `IPv4Packet` nie je definovaná.")

data = b"ahoj"
packet = IPv4Packet(
    version=4,
    ihl=5,  # 20 (celková dĺžka hlavičky) / 4 (4 B) = 5
    dscp=0,
    ecn=0,
    total_length=20 + len(data),
    identification=12345,
    dont_fragment=False,
    more_fragments=False,
    fragment_offset=0,
    ttl=64,
    protocol=6,  # TCP
    header_checksum=0,  # zvyčajne sa najprv nastaví 0, vypočíta sa reálny súčet
    source_address="192.168.1.10",
    destination_address="192.168.1.20",
    data=data,
)

# vypíše paket v binárnom tvare (jednotky a nuly):
print(packet.to_binary())

# ako údajová štruktúra `bytes`:
# print(pkt.to_bytes())
