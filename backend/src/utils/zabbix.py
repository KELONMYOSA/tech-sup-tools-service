from sqlalchemy import text

from src.database.db import maria_db


def create_traffic_link(host: str, interface: str) -> str | None:
    statement = text(f"""
SELECT DISTINCT h.hostid, g.graphid
FROM graphs g,
     graphs_items gi,
     items i,
     hosts h
WHERE h.host = '{host}'
  AND gi.graphid = g.graphid
  AND i.itemid = gi.itemid
  AND h.hostid = i.hostid
  AND h.status <> 3
  AND g.flags IN (0, 4)
  AND i.key_ = 'ifOutOctets[{interface}]'
""")
    with maria_db() as db:
        results = db.execute(statement).first()
        if results:
            return (
                f"https://zbxweb.comfortel.pro/zabbix.php?view_as=showgraph&action=charts.view&from=now-12h&to=now&"
                f"filter_hostids%5B%5D={results[0]}&filter_search_type=0&"
                f"filter_graphids%5B%5D={results[1]}&filter_set=1"
            )
        else:
            return None
