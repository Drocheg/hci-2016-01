package hci.itba.edu.ar.tpe2.fragment;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import com.nostra13.universalimageloader.core.ImageLoader;

import java.util.List;

import hci.itba.edu.ar.tpe2.R;
import hci.itba.edu.ar.tpe2.backend.data.Flight;
import hci.itba.edu.ar.tpe2.backend.data.PersistentData;

/**
 * Adapter for displaying list of flights. The Context that uses this adapter  MUST implement the
 * {@link hci.itba.edu.ar.tpe2.fragment.FlightsListFragment.OnFragmentInteractionListener} interface.
 */
public class FlightAdapter extends ArrayAdapter<Flight> {
    FlightsListFragment.OnFragmentInteractionListener interactionListener;
    ImageButton[] stars;

    FlightAdapter(Context context, List<Flight> flights) {
        super(context, 0, flights);
        if (!(context instanceof FlightsListFragment.OnFragmentInteractionListener)) {
            throw new ClassCastException(context.toString() + " must implement FlightsListFragment.OnFragmentInteractionListener");
        }
        interactionListener = (FlightsListFragment.OnFragmentInteractionListener) context;
        stars = new ImageButton[flights.size()];
    }

    @Override
    public View getView(final int position, View destination, ViewGroup parent) {
        final List<Flight> followedFlights = PersistentData.getInstance().getFollowedFlights();
        final Flight flight = getItem(position);
        if (destination == null) {  //Item hasn't been created, inflate it from Android's default layout
            destination = LayoutInflater.from(getContext()).inflate(R.layout.activity_flights_list_item, parent, false);
            destination.setTag(flight); //Tag it so we can find it later
        }
        //Logo
        ImageView icon = (ImageView) destination.findViewById(R.id.icon);
        ImageLoader.getInstance().displayImage(flight.getAirline().getLogoURL(), icon);
        //Text
        TextView title = (TextView) destination.findViewById(R.id.text1);
        title.setText(flight.getAirline().getName() + " #" + flight.getNumber());
        //Star
        stars[position] = (ImageButton) destination.findViewById(R.id.follow);
        stars[position].setImageResource(followedFlights.contains(flight) ? R.drawable.ic_star_on_24dp : R.drawable.ic_star_off_24dp);
        final View finalDestination = destination;      //Need to copy to use it in inner class
        stars[position].setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (followedFlights.contains(flight)) {
                    if (interactionListener.onFlightUnstarred(flight)) {
                        unstar(stars[position]);
                    }
                } else {
                    if (interactionListener.onFlightStarred(flight)) {
                        star(stars[position]);
                    }
                }
            }
        });
        return destination;
    }

    public void star(Flight flight) {
        int position = getPosition(flight);
        if (position != -1 && stars[position] != null) {
            star(stars[position]);
        }
    }

    private void star(ImageButton star) {
        star.setImageResource(R.drawable.ic_star_on_24dp);
    }

    public void unstar(Flight flight) {
        int position = getPosition(flight);
        if (position != -1 && stars[position] != null) {
            unstar(stars[position]);
        }
    }

    private void unstar(ImageButton star) {
        star.setImageResource(R.drawable.ic_star_off_24dp);
    }
}