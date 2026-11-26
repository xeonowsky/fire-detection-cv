# Eksperymenty ML

Skrypty badawcze — uruchamiane ręcznie, nie są częścią aplikacji. Kod gotowy do użycia w aplikacji przenosimy do
[`../firedetector_ml`](../firedetector_ml).

| Folder                   | Co jest w środku                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `grounded_sam/`          | Grounding DINO + SAM 2 na filmie z podglądem na żywo (`extractboundingboxes.py`), test detekcji |
| `dinov3_classification/` | klasyfikacja całego filmu DINOv3: model i funkcje pomocnicze, trening, test, wczytanie zbioru   |
| `dataset/`               | przygotowanie zbioru: wycinanie klatek, podział na klasy i na train/test                        |

## Uruchamianie

Skrypty mają na sztywno ścieżki do danych autora (`/home/...`) — przed uruchomieniem zmień je na swoje.
Uruchamiaj z folderu skryptu, np.:

```bash
cd ml/research/dinov3_classification
python test_dinov3.py
```

Zależności: jak w [`../requirements.txt`](../requirements.txt), a do części skryptów dodatkowo `datasets`,
`torchvision`, `torchmetrics`, `scikit-learn` i `tqdm`.
